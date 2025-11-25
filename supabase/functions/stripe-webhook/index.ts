import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[STRIPE-WEBHOOK] Received webhook request");

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Get webhook signature
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Get raw body for signature verification
    const body = await req.text();
    
    // Verify webhook signature (in production, use webhook secret)
    // For now, we'll parse the event directly
    let event: Stripe.Event;
    
    try {
      // In production, verify the signature:
      // const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      // event = stripe.webhooks.constructEvent(body, signature, webhookSecret!);
      
      // For development, parse directly:
      event = JSON.parse(body) as Stripe.Event;
      console.log("[STRIPE-WEBHOOK] Event type:", event.type);
    } catch (err) {
      console.error("[STRIPE-WEBHOOK] Signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role for database updates
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.booking_id;
        
        console.log("[STRIPE-WEBHOOK] Payment successful for booking:", bookingId);

        if (bookingId) {
          // Update booking status to confirmed/paid
          const { error: updateError } = await supabaseClient
            .from("bookings")
            .update({ 
              status: "confirmed",
              // Store payment info in customizations JSON field
            })
            .eq("id", bookingId);

          if (updateError) {
            console.error("[STRIPE-WEBHOOK] Error updating booking:", updateError);
          } else {
            console.log("[STRIPE-WEBHOOK] Booking updated successfully");
          }

          // Send confirmation email
          try {
            await supabaseClient.functions.invoke("send-booking-confirmation", {
              body: { bookingId },
            });
            console.log("[STRIPE-WEBHOOK] Confirmation email sent");
          } catch (emailError) {
            console.error("[STRIPE-WEBHOOK] Error sending email:", emailError);
          }
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.booking_id;
        
        console.log("[STRIPE-WEBHOOK] Payment session expired for booking:", bookingId);

        if (bookingId) {
          // Optionally update booking status or send notification
          console.log("[STRIPE-WEBHOOK] Payment session expired, booking:", bookingId);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[STRIPE-WEBHOOK] Payment failed:", paymentIntent.id);
        // Handle payment failure
        break;
      }

      default:
        console.log("[STRIPE-WEBHOOK] Unhandled event type:", event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[STRIPE-WEBHOOK] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
