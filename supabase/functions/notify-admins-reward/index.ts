import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RewardNotificationRequest {
  clientName: string;
  clientEmail: string;
  visitsCount: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientName, clientEmail, visitsCount } = await req.json() as RewardNotificationRequest;

    console.log(`Sending reward notification for client: ${clientName} (${clientEmail}) with ${visitsCount} visits`);

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminEmails = ['jorge.zendejas1@gmail.com', 'pitayanailscancun@gmail.com'];

    // Email HTML template para admins
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #E91E8C 0%, #9F5FD4 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .celebration {
              font-size: 48px;
              margin: 10px 0;
            }
            .content {
              background: #fff;
              padding: 30px;
              border: 2px solid #E91E8C;
              border-top: none;
              border-radius: 0 0 10px 10px;
            }
            .client-info {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #E91E8C;
            }
            .client-info p {
              margin: 8px 0;
            }
            .client-info strong {
              color: #E91E8C;
            }
            .reward-badge {
              background: linear-gradient(135deg, #FFD700 0%, #E91E8C 100%);
              color: white;
              padding: 15px 25px;
              border-radius: 25px;
              text-align: center;
              font-weight: bold;
              font-size: 18px;
              margin: 20px 0;
              box-shadow: 0 4px 15px rgba(233, 30, 140, 0.3);
            }
            .action-items {
              background: #fff5f7;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .action-items h3 {
              color: #E91E8C;
              margin-top: 0;
            }
            .action-items ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .action-items li {
              margin: 8px 0;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="celebration">🎉✨💅</div>
            <h1>¡Una Clienta Alcanzó su Recompensa!</h1>
          </div>
          
          <div class="content">
            <div class="reward-badge">
              🎁 8VA VISITA GRATIS DESBLOQUEADA 🎁
            </div>

            <p>¡Excelentes noticias! Una de nuestras clientas leales ha completado <strong>7 visitas</strong> y ha desbloqueado su <strong>servicio completamente GRATIS</strong>.</p>

            <div class="client-info">
              <p><strong>👤 Nombre:</strong> ${clientName}</p>
              <p><strong>📧 Email:</strong> ${clientEmail}</p>
              <p><strong>⭐ Visitas Completadas:</strong> ${visitsCount} de 8</p>
              <p><strong>🎁 Estado:</strong> ¡Próxima visita GRATIS!</p>
            </div>

            <div class="action-items">
              <h3>📋 Acciones Recomendadas:</h3>
              <ul>
                <li>💬 <strong>Felicítala personalmente</strong> cuando reserve o llegue a su próxima cita</li>
                <li>📱 <strong>Envíale un mensaje especial</strong> por WhatsApp para celebrar su logro</li>
                <li>📸 <strong>Toma fotos del resultado</strong> para compartir su experiencia (con su permiso)</li>
                <li>🌟 <strong>Hazla sentir especial</strong> - es una clienta leal que merece reconocimiento</li>
                <li>💝 <strong>Considera un detalle extra</strong> para celebrar su lealtad</li>
              </ul>
            </div>

            <p style="text-align: center; margin-top: 30px; color: #666; font-style: italic;">
              Esta clienta ha demostrado su lealtad a Pitaya Nails. ¡Hagamos que su próxima visita gratis sea inolvidable! 💖
            </p>
          </div>

          <div class="footer">
            <p>Este es un mensaje automático del sistema de lealtad de Pitaya Nails</p>
            <p>🌺 Pitaya Nails - Cancún, Quintana Roo</p>
          </div>
        </body>
      </html>
    `;

    // Enviar email a ambos admins
    const emailPromises = adminEmails.map(async (adminEmail) => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Pitaya Nails <noreply@pitayanails.com>',
          to: adminEmail,
          subject: `🎉 ¡${clientName} alcanzó su 8va visita GRATIS!`,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to send email to ${adminEmail}:`, errorText);
        throw new Error(`Failed to send email to ${adminEmail}`);
      }

      const result = await response.json();
      console.log(`Email sent successfully to ${adminEmail}:`, result);
      return result;
    });

    // Enviar a todos los admins en paralelo
    await Promise.all(emailPromises);

    console.log(`Successfully sent reward notifications to all admins for ${clientName}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin notifications sent successfully',
        clientName,
        visitsCount 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in notify-admins-reward:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to send admin notifications'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
