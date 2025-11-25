# Configuración del Webhook de Stripe para Pitaya Nails

Este documento explica cómo configurar el webhook de Stripe para recibir notificaciones de eventos de pago en tu aplicación de producción.

## ¿Qué es un Webhook?

Un webhook es un endpoint HTTP que Stripe llama automáticamente cuando ocurre un evento importante (como un pago exitoso). Esto permite que tu aplicación se actualice en tiempo real sin necesidad de consultar constantemente el estado de los pagos.

## Paso 1: Obtener la URL del Webhook

Tu endpoint de webhook es:
```
https://hwzssuideymfwjeivwlg.supabase.co/functions/v1/stripe-webhook
```

## Paso 2: Configurar el Webhook en Stripe Dashboard

1. **Accede al Dashboard de Stripe:**
   - Ve a https://dashboard.stripe.com
   - Inicia sesión con tu cuenta

2. **Navega a Webhooks:**
   - En el menú lateral, haz clic en "Developers" (Desarrolladores)
   - Selecciona "Webhooks"
   - Haz clic en "Add endpoint" (Agregar endpoint)

3. **Configura el Endpoint:**
   - **Endpoint URL:** Pega la URL del webhook de arriba
   - **Events to send:** Selecciona los siguientes eventos:
     - `checkout.session.completed` (obligatorio)
     - `checkout.session.expired` (recomendado)
     - `payment_intent.payment_failed` (recomendado)
   
4. **Guarda el Endpoint:**
   - Haz clic en "Add endpoint"

## Paso 3: Obtener el Webhook Secret

1. Una vez creado el endpoint, verás una sección llamada "Signing secret"
2. Haz clic en "Reveal" para ver el secret
3. Copia el valor (comienza con `whsec_...`)

## Paso 4: Configurar el Webhook Secret como Variable de Entorno

**IMPORTANTE:** En producción, debes verificar la firma del webhook usando el secret.

Para configurar el secret en Lovable Cloud:

1. Ve a tu proyecto en Lovable
2. Abre el Cloud dashboard
3. Ve a "Secrets"
4. Agrega un nuevo secret:
   - **Nombre:** `STRIPE_WEBHOOK_SECRET`
   - **Valor:** El secret que copiaste (ejemplo: `whsec_xxxxxxxxxxxxx`)

## Paso 5: Actualizar el Edge Function (Producción)

Para activar la verificación de firma en producción, actualiza el archivo `supabase/functions/stripe-webhook/index.ts`:

Reemplaza esta línea:
```typescript
// For development, parse directly:
event = JSON.parse(body) as Stripe.Event;
```

Con esto:
```typescript
// For production, verify signature:
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
if (!webhookSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
}
event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

## Paso 6: Probar el Webhook

1. **Prueba en Modo Test:**
   - Stripe proporciona una herramienta para enviar eventos de prueba
   - En la página del webhook, haz clic en "Send test webhook"
   - Selecciona `checkout.session.completed`
   - Haz clic en "Send test webhook"

2. **Verifica los Logs:**
   - En Lovable Cloud, ve a "Edge Functions" > "stripe-webhook" > "Logs"
   - Deberías ver el evento procesado correctamente

3. **Prueba Real:**
   - Realiza una reserva de prueba en tu aplicación
   - Completa el pago con una tarjeta de prueba de Stripe
   - Verifica que:
     - El pago se procese correctamente
     - La reserva se actualice en la base de datos
     - Se envíe el email de confirmación

## Tarjetas de Prueba de Stripe

Usa estas tarjetas para probar diferentes escenarios:

- **Pago exitoso:** `4242 4242 4242 4242`
- **Requiere autenticación:** `4000 0025 0000 3155`
- **Pago rechazado:** `4000 0000 0000 9995`

**Detalles adicionales para pruebas:**
- **CVV:** Cualquier 3 dígitos (ej: 123)
- **Fecha de expiración:** Cualquier fecha futura (ej: 12/25)
- **Código postal:** Cualquier código válido (ej: 77500)

## Eventos del Webhook

El webhook procesa los siguientes eventos:

### 1. `checkout.session.completed`
- Se dispara cuando un pago se completa exitosamente
- Actualiza el estado de la reserva a "confirmed"
- Envía email de confirmación al cliente

### 2. `checkout.session.expired`
- Se dispara cuando una sesión de pago expira sin completarse
- Útil para tracking y notificaciones

### 3. `payment_intent.payment_failed`
- Se dispara cuando un pago falla
- Permite enviar notificaciones al cliente

## Seguridad

### En Desarrollo:
- El webhook procesa eventos sin verificar la firma
- Esto es solo para desarrollo rápido
- **NO uses esto en producción**

### En Producción:
- **SIEMPRE** verifica la firma del webhook usando `STRIPE_WEBHOOK_SECRET`
- Esto garantiza que los eventos provienen realmente de Stripe
- Previene ataques de suplantación

## Monitoreo

### Ver Logs del Webhook:
1. En Lovable Cloud, ve a "Edge Functions"
2. Selecciona "stripe-webhook"
3. Ve a la pestaña "Logs"

### Ver Eventos en Stripe:
1. En el Dashboard de Stripe, ve a "Developers" > "Webhooks"
2. Haz clic en tu endpoint
3. Verás un historial de todos los eventos enviados

## Solución de Problemas

### El webhook no recibe eventos:
- Verifica que la URL del endpoint sea correcta
- Asegúrate de que el endpoint esté activo en Stripe
- Revisa que los eventos correctos estén seleccionados

### Error de verificación de firma:
- Verifica que `STRIPE_WEBHOOK_SECRET` esté configurado correctamente
- Asegúrate de estar usando el secret correcto (test vs live)
- El secret debe ser el del endpoint específico, no el general

### La reserva no se actualiza:
- Revisa los logs del edge function
- Verifica que el `booking_id` se esté pasando correctamente en los metadatos
- Asegúrate de que la base de datos esté accesible

## URLs Importantes

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Documentación de Webhooks:** https://stripe.com/docs/webhooks
- **Eventos disponibles:** https://stripe.com/docs/api/events/types
- **Pruebas con tarjetas:** https://stripe.com/docs/testing

## Soporte

Si tienes problemas configurando el webhook:

1. Revisa los logs en Lovable Cloud
2. Consulta la documentación de Stripe
3. Contacta al equipo de soporte de Lovable
4. Revisa este documento nuevamente

---

**Nota:** Este webhook es esencial para el funcionamiento correcto de los pagos en producción. Asegúrate de configurarlo antes de lanzar la aplicación.
