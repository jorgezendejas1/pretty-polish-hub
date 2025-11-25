# 💳 Guía de Activación: Stripe Pagos Reales

Esta guía te ayudará a activar pagos reales con Stripe en Pitaya Nails para comenzar a cobrar depósitos o pagos completos en reservas.

---

## 📋 ¿Por Qué Stripe?

Pitaya Nails puede integrar Stripe para:
- ✅ Cobrar **depósitos** al momento de reservar (ej: $200 MXN)
- ✅ Procesar **pagos completos** por adelantado
- ✅ Reducir **no-shows** (clientes que no llegan)
- ✅ Asegurar **ingresos** antes del servicio
- ✅ Ofrecer **paquetes prepagados** con descuento

**Beneficios para el Negocio:**
- Mayor compromiso de clientes
- Menos cancelaciones de último minuto
- Flujo de caja mejorado
- Proceso de pago profesional y seguro

---

## 🚀 Paso 1: Crear Cuenta de Stripe

### 1.1 Registro Inicial

1. Ve a [stripe.com](https://stripe.com)
2. Click en **"Comenzar ahora"** o **"Sign up"**
3. Completa el registro con:
   - Email del negocio
   - Nombre del negocio: **Pitaya Nails**
   - País: **México (MX)**
   - Contraseña segura

### 1.2 Activar Tu Cuenta

Para recibir pagos reales, debes activar tu cuenta:

1. Inicia sesión en [dashboard.stripe.com](https://dashboard.stripe.com)
2. Verás un banner: **"Activate your account to start accepting real payments"**
3. Click en **"Activate account"**
4. Completa el formulario con información del negocio:

**Información del Negocio:**
- Nombre legal: (como aparece en documentos oficiales)
- RFC: (Registro Federal de Contribuyentes)
- Dirección completa: Jardines del Sur 5, Cancún, Q. Roo, 77536
- Teléfono: +52 998 590 0050
- Categoría: **Personal Care Services** o **Beauty Salons**
- Descripción: "Salón de uñas profesional con servicios de manicura, pedicura y nail art"

**Información Personal (Representante Legal):**
- Nombre completo
- Fecha de nacimiento
- CURP (opcional pero recomendado)
- Dirección

**Información Bancaria:**
- Banco
- CLABE interbancaria (18 dígitos)
- Beneficiario (titular de la cuenta)

4. Acepta los términos y condiciones
5. Click en **"Submit"**

**Tiempo de Aprobación:** 1-3 días hábiles

---

## 🔑 Paso 2: Obtener API Keys

### 2.1 Obtener Claves de Prueba (Sandbox)

Mientras se aprueba tu cuenta, puedes usar claves de prueba:

1. Ve a [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Verás dos claves:
   - **Publishable key**: Empieza con `pk_test_...`
   - **Secret key**: Empieza con `sk_test_...` (Click en "Reveal test key")

**Nota:** Las claves de prueba NO cobran dinero real.

### 2.2 Obtener Claves de Producción (Live)

Después de que tu cuenta sea aprobada:

1. Toggle el switch de **Test mode** a **Live mode** (esquina superior derecha)
2. Ve a [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
3. Copia tus claves de producción:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`

---

## ⚙️ Paso 3: Configurar Stripe en Lovable

### 3.1 Habilitar Integración de Stripe

1. Abre tu proyecto en [Lovable](https://lovable.dev/projects/0a94cf08-541c-4748-bddb-3bd5086646f1)
2. En el chat, escribe:
   ```
   Habilita la integración de Stripe para cobrar depósitos en reservas
   ```
3. Lovable te mostrará un botón para habilitar Stripe
4. Click en el botón y pega tu **Secret Key** cuando se te solicite

**Importante:** Usa `sk_test_...` para pruebas, `sk_live_...` para producción.

### 3.2 Configurar en .env (Automático)

Lovable configurará automáticamente:
```env
STRIPE_SECRET_KEY=sk_test_51... (o sk_live_51...)
```

**Nota:** Este valor se guarda de forma segura en Lovable Cloud Secrets.

---

## 💻 Paso 4: Implementar Cobro de Depósito

### 4.1 Modificar Booking Flow

Lovable puede agregar un paso de pago en el flujo de reserva:

```typescript
// En BookingFlow.tsx - Paso de Pago
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_...');

function PaymentStep({ bookingData, onComplete }) {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Crear Payment Intent en el servidor
    supabase.functions.invoke('create-payment-intent', {
      body: {
        amount: 20000, // $200 MXN en centavos
        currency: 'mxn',
        bookingId: bookingData.id
      }
    }).then(({ data }) => {
      setClientSecret(data.clientSecret);
    });
  }, []);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onComplete={onComplete} />
    </Elements>
  );
}
```

### 4.2 Crear Edge Function para Payment Intent

Lovable creará automáticamente un edge function:

```typescript
// supabase/functions/create-payment-intent/index.ts
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.10.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  const { amount, currency, bookingId } = await req.json();

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: { bookingId },
  });

  return new Response(
    JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### 4.3 Manejar Confirmación de Pago

```typescript
// Webhook para confirmar pago
supabase.functions.invoke('stripe-webhook', {
  body: event
});

// Actualizar estado de booking
await supabase
  .from('bookings')
  .update({ 
    payment_status: 'paid',
    payment_intent_id: paymentIntent.id 
  })
  .eq('id', bookingId);
```

---

## 🧪 Paso 5: Testing con Tarjetas de Prueba

### Tarjetas de Prueba de Stripe

**Pago Exitoso:**
```
Número: 4242 4242 4242 4242
Vencimiento: Cualquier fecha futura (ej: 12/25)
CVV: Cualquier 3 dígitos (ej: 123)
ZIP: Cualquier 5 dígitos (ej: 77536)
```

**3D Secure (Autenticación):**
```
Número: 4000 0025 0000 3155
Requiere autenticación adicional
```

**Pago Rechazado:**
```
Número: 4000 0000 0000 0002
Simula tarjeta declinada
```

### Verificar Pagos de Prueba

1. Ve a [dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments)
2. Verás todos los pagos de prueba
3. Detalles de cada transacción

---

## 🎯 Paso 6: Activar Pagos Reales (Live Mode)

### 6.1 Verificación Final

Antes de activar pagos reales:
- ✅ Cuenta de Stripe activada y aprobada
- ✅ Información bancaria verificada
- ✅ Claves de producción obtenidas (`pk_live_...`, `sk_live_...`)
- ✅ Flujo de pago testeado en modo sandbox
- ✅ Webhooks configurados correctamente

### 6.2 Cambiar a Producción

1. En Lovable, actualiza el secret con la clave live:
   ```
   Actualiza STRIPE_SECRET_KEY con mi clave de producción
   ```

2. En el frontend, actualiza la Publishable Key:
   ```typescript
   const stripePromise = loadStripe('pk_live_...');
   ```

3. Deploy a producción:
   - Click en **Share → Publish** en Lovable

### 6.3 Configurar Webhooks

Para recibir notificaciones de pagos:

1. Ve a [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click en **"Add endpoint"**
3. URL del endpoint:
   ```
   https://hwzssuideymfwjeivwlg.supabase.co/functions/v1/stripe-webhook
   ```
4. Selecciona eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click en **"Add endpoint"**
6. Copia el **Signing secret** (empieza con `whsec_...`)
7. Agrégalo en Lovable Cloud Secrets:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## 💰 Paso 7: Configurar Montos y Políticas

### Montos Recomendados

**Depósito Estándar:**
```typescript
const DEPOSIT_AMOUNTS = {
  manicura: 20000, // $200 MXN
  pedicura: 25000, // $250 MXN
  acrylic: 40000,  // $400 MXN
  package: 35000   // $350 MXN
};
```

**Pago Completo:**
```typescript
const totalAmount = booking.total_price * 100; // Convertir a centavos
```

### Política de Cancelaciones

Agrega términos claros en el flujo de pago:

```typescript
<Alert>
  <AlertTitle>Política de Depósito</AlertTitle>
  <AlertDescription>
    • El depósito se reembolsa al 100% si cancelas con 24 horas de anticipación
    • Cancelaciones con menos de 24h: depósito no reembolsable
    • El saldo restante se paga en el salón
  </AlertDescription>
</Alert>
```

---

## 📊 Paso 8: Monitoreo y Reportes

### Dashboard de Stripe

Revisa regularmente:
- **Pagos**: [dashboard.stripe.com/payments](https://dashboard.stripe.com/payments)
- **Clientes**: [dashboard.stripe.com/customers](https://dashboard.stripe.com/customers)
- **Disputas**: [dashboard.stripe.com/disputes](https://dashboard.stripe.com/disputes)
- **Balance**: [dashboard.stripe.com/balance](https://dashboard.stripe.com/balance)

### Reportes Automáticos

Stripe envía reportes diarios por email:
- Resumen de transacciones
- Depósitos pendientes
- Disputas o chargebacks

### Integración con Contabilidad

Exporta datos para tu contador:
1. Ve a **Reports** → **Downloads**
2. Selecciona rango de fechas
3. Descarga CSV o PDF
4. Envía a tu contador

---

## 🔒 Seguridad y Compliance

### PCI Compliance

Stripe maneja automáticamente:
- ✅ Encriptación de tarjetas
- ✅ Cumplimiento PCI DSS Level 1
- ✅ Tokenización segura
- ✅ Protección contra fraude

**Tú nunca ves o almacenas datos de tarjetas.**

### Prevención de Fraude

Stripe Radar (incluido gratis) detecta:
- Transacciones sospechosas
- Tarjetas robadas
- Patrones de fraude

Puedes revisar y bloquear pagos en [dashboard.stripe.com/radar](https://dashboard.stripe.com/radar)

---

## 💵 Costos de Stripe en México

### Tarifas por Transacción

**Tarjetas Mexicanas:**
- 3.6% + $3 MXN por transacción exitosa
- Sin costo mensual
- Sin costo de setup

**Tarjetas Internacionales:**
- 3.6% + $3 MXN + 1.5% extra

**Ejemplo:**
- Depósito de $200 MXN
- Comisión: ($200 × 3.6%) + $3 = $7.20 + $3 = **$10.20 MXN**
- Recibes: $189.80 MXN

### Depósitos a Tu Cuenta

- **Frecuencia**: Cada 2 días hábiles (default)
- **Puede configurarse**: Semanal o mensual
- **Sin costo de transferencia**

---

## 🛠️ Troubleshooting

### Error: "API key is invalid"

**Solución:**
1. Verifica que copiaste la clave completa
2. Asegúrate de usar `sk_test_` o `sk_live_` correctamente
3. Regenera la clave en Stripe Dashboard si es necesario

### Error: "Amount must be at least $0.50 usd"

**Solución:**
- Stripe requiere mínimo $10 MXN (1000 centavos)
- Verifica que el monto esté en centavos: `amount: 20000` = $200 MXN

### Pagos no aparecen en el dashboard

**Solución:**
1. Verifica que estés en el modo correcto (Test vs Live)
2. Espera 1-2 minutos para que se sincronice
3. Revisa logs del edge function en Lovable Cloud

### Cliente no recibe confirmación de pago

**Solución:**
1. Verifica webhook esté configurado
2. Revisa logs de `stripe-webhook` edge function
3. Confirma que el email en Stripe sea correcto

---

## 📞 Soporte

### Stripe Support

- **Documentación**: [stripe.com/docs](https://stripe.com/docs)
- **API Reference**: [stripe.com/docs/api](https://stripe.com/docs/api)
- **Email Support**: Disponible desde el dashboard
- **Chat en Vivo**: Para cuentas activadas

### Lovable Support

- **Documentación**: [docs.lovable.dev](https://docs.lovable.dev)
- **Discord**: [Comunidad Lovable](https://discord.gg/lovable)
- **Email**: jorge.zendejas1@gmail.com

---

## ✅ Checklist de Activación

Usa esta lista para verificar que todo esté configurado:

- [ ] Cuenta de Stripe creada y activada
- [ ] Información del negocio completada y verificada
- [ ] Información bancaria agregada
- [ ] API keys obtenidas (test y live)
- [ ] Integración de Stripe habilitada en Lovable
- [ ] Secret key configurada en Lovable Cloud Secrets
- [ ] Flujo de pago implementado en BookingFlow
- [ ] Edge functions creadas y desplegadas
- [ ] Pagos de prueba exitosos con tarjetas de test
- [ ] Webhooks configurados en Stripe
- [ ] Webhook secret agregado a Lovable
- [ ] Política de cancelación comunicada claramente
- [ ] Cambio a claves de producción (pk_live, sk_live)
- [ ] Deploy a producción realizado
- [ ] Primer pago real testeado
- [ ] Monitoreo de dashboard configurado

---

**¡Listo para cobrar!** 🎉

Una vez completados todos los pasos, Pitaya Nails estará procesando pagos reales de forma segura y profesional.

Para soporte adicional o personalizaciones, contacta a jorge.zendejas1@gmail.com
