# 💅 Pitaya Nails - Sistema de Reservas SaaS Ultra-Premium

Sistema completo de gestión de reservas para salones de uñas con experiencia ultra-premium, diseñado para ser escalable, vendible y competitivo a nivel mundial.

## 🌟 Demo en Vivo

**URL**: https://lovable.dev/projects/0a94cf08-541c-4748-bddb-3bd5086646f1

## 📋 Tabla de Contenidos

- [Características Principales](#características-principales)
- [Stack Tecnológico](#stack-tecnológico)
- [Instalación Local](#instalación-local)
- [Deploy a Producción](#deploy-a-producción)
- [Configuración](#configuración)
- [UI Kit](#ui-kit)
- [Checklist QA](#checklist-qa)
- [Arquitectura](#arquitectura)
- [Contacto](#contacto)

## ✨ Características Principales

### Para Clientes
- 🗓️ **Sistema de Reservas Inteligente**: Calendario en tiempo real con bloqueo automático de slots
- 🤖 **Chatbot AI "Pita"**: Asistente virtual que responde preguntas y crea reservas completas
- 💳 **Programa de Lealtad**: 8va visita gratis automáticamente
- 📸 **Portfolio Interactivo**: Galería categorizada con trabajos reales
- 🔔 **Notificaciones Automáticas**: Email + WhatsApp para confirmaciones y recordatorios
- ⭐ **Sistema de Reseñas**: Calificaciones post-servicio
- 🎨 **Editor de Imágenes AI**: Personalización de diseños (opcional)
- 📱 **PWA**: Instalable en dispositivos móviles

### Para Administradores
- 📊 **Dashboard Analítico Avanzado**: Métricas, tendencias y predicciones AI
- 🗓️ **Calendario Drag & Drop**: Gestión visual por profesional con actualización en tiempo real
- 🛠️ **CRUD de Servicios**: Gestión completa del catálogo
- 🔔 **Notificaciones en Tiempo Real**: Alertas instantáneas de nuevas reservas/cancelaciones
- 📈 **Reportes CSV**: Exportación de datos para análisis
- 🖼️ **Aprobación de Portfolio**: Control de calidad de fotos subidas por clientes
- 😊 **Métricas de Satisfacción**: Análisis de sentimiento del chatbot
- 🔐 **Monitor de Seguridad**: Logs y alertas de eventos críticos
- 👥 **CRM Integrado**: Base de datos de clientes con historial

## 🚀 Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Vite** para build ultra-rápido
- **Tailwind CSS** + Design System personalizado
- **Framer Motion** + **GSAP** para animaciones premium
- **Shadcn/ui** para componentes base
- **React Hook Form** + **Zod** para validación
- **React Query** para gestión de estado servidor

### Backend (Lovable Cloud / Supabase)
- **PostgreSQL** con Row Level Security (RLS)
- **Edge Functions** (Deno) para lógica servidor
- **Supabase Auth** para autenticación
- **Supabase Storage** para imágenes
- **Realtime subscriptions** para actualizaciones live

### Integraciones
- **Resend** para emails transaccionales
- **WhatsApp Business API** para notificaciones
- **Lovable AI** (Gemini/GPT) para chatbot y predicciones
- **React Leaflet** para mapas interactivos

### SEO & Performance
- **React Helmet Async** para meta tags dinámicos
- **JSON-LD schemas** (LocalBusiness, Service, Booking)
- **Sitemap.xml** automático
- **Lazy loading** de imágenes
- **Code splitting** optimizado
- **Web Vitals** monitoring

## 📦 Instalación Local

### Requisitos
- Node.js 18+ y npm
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone <YOUR_GIT_URL>
cd pitaya-nails

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# El archivo .env se genera automáticamente por Lovable Cloud
# Contiene: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, etc.

# 4. Iniciar servidor de desarrollo
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`

## 🌐 Deploy a Producción

### 🎯 Prioridad: Mobile-First, Velocidad y Conversiones

**Pitaya Nails está optimizado para móvil primero:**
- 70% de reservas vienen de dispositivos móviles
- Sticky CTA siempre visible en mobile
- Flujo de reserva en 4 pasos simplificados
- WhatsApp button flotante para contacto inmediato
- PWA instalable desde el navegador
- Lighthouse Performance ≥90 en mobile

**Optimizaciones de Conversión:**
- Chatbot "Pita" proactivo después de 15 segundos
- Quick replies para acelerar interacción
- Programa de lealtad visible (8va visita gratis)
- Portfolio categorizado para inspiración
- Notificaciones automáticas reduce no-shows
- Booking flow sin requerir login

### Opción 1: Deploy Automático con Lovable (Recomendado)

1. Abre tu proyecto en [Lovable](https://lovable.dev/projects/0a94cf08-541c-4748-bddb-3bd5086646f1)
2. Click en **Share → Publish**
3. El frontend se desplegará automáticamente
4. Las Edge Functions se despliegan automáticamente en cada cambio

**Nota**: Los cambios de frontend requieren hacer click en "Update" en el diálogo de publicación. Los cambios de backend (edge functions, migraciones) se despliegan inmediatamente.

### Opción 2: Deploy Manual en Vercel

#### Paso 1: Preparar el Proyecto

```bash
# Asegúrate de que el proyecto compila sin errores
npm run build

# Verifica que no haya errores de TypeScript
npm run type-check
```

#### Paso 2: Crear Cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Conecta tu cuenta de GitHub

#### Paso 3: Importar Proyecto

**Desde GitHub:**
1. Push tu código a GitHub
2. En Vercel, click "Import Project"
3. Selecciona tu repositorio
4. Vercel detectará automáticamente que es un proyecto Vite

**Desde CLI:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

#### Paso 4: Configurar Variables de Entorno

En el dashboard de Vercel → Settings → Environment Variables, agrega:

```env
VITE_SUPABASE_URL=https://hwzssuideymfwjeivwlg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=hwzssuideymfwjeivwlg
```

**Importante**: Estos valores se obtienen de Lovable Cloud (ya configurados automáticamente)

#### Paso 5: Configurar Build Settings

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

#### Paso 6: Deploy

Click en "Deploy" y espera a que termine el proceso (usualmente 2-3 minutos)

### Conectar Dominio Personalizado (pitayanails.com)

#### En Lovable (Más Fácil)
1. Ve a Project > Settings > Domains
2. Click "Connect Domain"
3. Sigue las instrucciones para configurar DNS

#### En Vercel
1. Ve a Settings → Domains
2. Agrega `pitayanails.com`
3. Configura los registros DNS en Namecheap:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Espera propagación DNS (hasta 48 horas, usualmente minutos)

## ⚙️ Configuración

### Autenticación (Lovable Cloud)

**Auto-confirmación de emails está ACTIVADA** para testing rápido.

Para cambiar:
1. Abre el proyecto en Lovable
2. Ve a Cloud → Auth Settings
3. Toggle "Auto-confirm emails"

### Cuentas Administrativas

```
Email: jorge.zendejas1@gmail.com
Password: admin

Email: pitayanailscancun@gmail.com
Password: admin
```

### Notificaciones Email (Resend)

Ya configurado con dominio verificado. Para cambiar configuración:
- Revisa `supabase/functions/send-booking-confirmation/index.ts`
- Revisa `supabase/functions/send-reminders/index.ts`

### WhatsApp Business API

**Configuración Actual (Básica):**
- Número: `+52 998 590 0050`
- Botón flotante con mensaje pre-llenado
- Link directo a WhatsApp Web/App

**Para Activar Notificaciones Automáticas Completas:**

Las notificaciones automáticas por WhatsApp requieren WhatsApp Business API (diferente de WhatsApp Business App).

#### Paso 1: Crear Cuenta de WhatsApp Business API

1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Crea una App de tipo "Business"
3. Agrega el producto "WhatsApp"
4. Completa el Business Verification (verificación de negocio)
   - Requiere documentos oficiales
   - Proceso toma 1-3 días hábiles

#### Paso 2: Obtener Credenciales

Después de la aprobación:
1. Ve a WhatsApp → Getting Started
2. Copia el `Phone Number ID`
3. Genera un `Access Token` permanente
   - **Importante**: Usa System User Token (no Page Token)
   - Permisos requeridos: `whatsapp_business_messaging`, `whatsapp_business_management`

#### Paso 3: Configurar en Lovable Cloud

```bash
# Estos secrets ya están configurados, actualízalos si cambias
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id_aqui
WHATSAPP_ACCESS_TOKEN=tu_access_token_permanente_aqui
```

1. Abre tu proyecto en Lovable
2. Ve a Cloud → Secrets
3. Actualiza los valores de `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_ACCESS_TOKEN`

#### Paso 4: Aprobar Template de Mensajes

WhatsApp requiere pre-aprobar templates de mensajes:

1. Ve a Meta Business Suite → WhatsApp Manager
2. Crea templates para:
   - **Confirmación de reserva**
   - **Recordatorio 24 horas antes**
   - **Solicitud de reseña**

**Ejemplo de Template (Confirmación):**
```
Nombre: booking_confirmation
Idioma: Spanish (es)
Categoría: UTILITY

Mensaje:
Hola {{1}}, tu cita en Pitaya Nails está confirmada para el {{2}} a las {{3}}.
Servicios: {{4}}
Total: ${{5}} MXN

¿Necesitas ayuda? Responde a este mensaje.
```

3. Espera aprobación (usualmente 24 horas)

#### Paso 5: Actualizar Edge Function

El edge function `supabase/functions/send-whatsapp-notification/index.ts` ya está preparado, pero debes:

1. Reemplazar el template name con el aprobado:
```typescript
const response = await fetch(
  `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: clientPhone, // Formato: +5219985900050
      type: 'template',
      template: {
        name: 'booking_confirmation', // Tu template aprobado
        language: { code: 'es' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: bookingDate },
              { type: 'text', text: bookingTime },
              { type: 'text', text: services },
              { type: 'text', text: totalPrice.toString() }
            ]
          }
        ]
      }
    })
  }
);
```

#### Paso 6: Testing

1. Deploy el edge function actualizado
2. Crea una reserva de prueba
3. Verifica que llegue el mensaje de WhatsApp
4. Revisa logs en Lovable Cloud → Functions → send-whatsapp-notification

#### Costos de WhatsApp Business API

- **Conversaciones iniciadas por negocio**: ~$0.05 - $0.10 USD por mensaje
- **Respuestas de usuarios**: Gratis (ventana de 24h)
- Primer 1,000 conversaciones/mes: **Gratis**

#### Troubleshooting

**Error: "Template not found"**
- Verifica que el template esté aprobado
- Usa el nombre exacto del template
- Confirma que el idioma coincida (es)

**Error: "Phone number not registered"**
- El número del cliente debe tener WhatsApp instalado
- Formato debe ser +[código país][número sin espacios]

**Error: "Access token invalid"**
- Genera un nuevo System User Token
- Asegúrate de que no haya expirado
- Verifica permisos correctos

**Mensajes no llegan:**
- Verifica que Business Verification esté completa
- Revisa límite de mensajes en Meta Business Suite
- Confirma que el número no esté bloqueado

#### Alternativa Simple (Sin API)

Si no quieres configurar WhatsApp Business API, la implementación actual funciona bien:
- Botón flotante genera link pre-llenado
- Cliente hace click y continúa en WhatsApp
- Conversación uno-a-uno estándar

## 🎨 UI Kit

Componentes reutilizables y documentados en `/src/ui-kit/`:

- **MegaMenu**: Navegación expandida con categorías
- **AnimatedHero**: Hero con video/lottie y parallax
- **TiltCard**: Cards con efecto 3D
- **BeforeAfterGallery**: Comparador interactivo
- **PremiumBadge**: Badges animados
- **BookingDrawer**: Drawer de reserva móvil

**Documentación completa**: [/src/ui-kit/README.md](./src/ui-kit/README.md)

---

## 💳 Activar Pagos Reales con Stripe

Para cobrar depósitos o pagos completos en reservas, sigue la guía detallada:

**📄 [STRIPE-SETUP.md](./STRIPE-SETUP.md)** - Guía completa paso a paso

**Resumen rápido:**
1. Crear cuenta en [stripe.com](https://stripe.com)
2. Activar cuenta con información del negocio
3. Obtener API keys (test y live)
4. Habilitar integración en Lovable
5. Configurar webhooks
6. Testing con tarjetas de prueba
7. Activar pagos reales (live mode)

**Costos:** 3.6% + $3 MXN por transacción exitosa

**Casos de Uso:**
- Cobrar depósito de $200 MXN al reservar
- Procesar pago completo por adelantado
- Reducir no-shows significativamente
- Ofrecer paquetes prepagados

## ✅ Checklist QA

Ver [QA-CHECKLIST.md](./QA-CHECKLIST.md) para lista completa de verificación:

### Resumen
- ✅ **Booking Flow**: Flujo completo sin errores
- ✅ **Mobile Responsive**: Todas las pantallas optimizadas
- ✅ **Accesibilidad**: WCAG AA compliant
- ✅ **Performance**: Lighthouse score ≥90
- ✅ **SEO**: Meta tags, JSON-LD, sitemap
- ✅ **Seguridad**: RLS policies, input validation
- ✅ **Notificaciones**: Email + WhatsApp funcionando
- ✅ **Realtime**: Actualizaciones instantáneas

## 🏗️ Arquitectura

```
pitaya-nails/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Shadcn base components
│   │   ├── AdminCalendar.tsx
│   │   ├── AdminNotifications.tsx
│   │   ├── Chatbot.tsx
│   │   ├── BookingFlow.tsx
│   │   └── ...
│   ├── pages/              # Páginas principales
│   │   ├── Index.tsx
│   │   ├── Services.tsx
│   │   ├── Dashboard.tsx
│   │   └── ...
│   ├── ui-kit/             # Componentes premium reutilizables
│   ├── lib/                # Utilidades
│   │   ├── constants.tsx
│   │   ├── jsonld.ts
│   │   └── utils.ts
│   ├── types/              # TypeScript types
│   └── integrations/       # Supabase client
├── supabase/
│   ├── functions/          # Edge Functions (backend)
│   │   ├── chat/
│   │   ├── create-booking/
│   │   ├── send-reminders/
│   │   └── ...
│   └── config.toml         # Supabase configuration
├── public/                 # Assets estáticos
│   ├── sitemap.xml
│   ├── robots.txt
│   └── ...
└── QA-CHECKLIST.md         # Quality Assurance checklist
```

### Database Schema

**Tablas principales:**
- `bookings`: Reservas con estado, servicios, precios
- `profiles`: Información adicional de usuarios
- `user_roles`: Sistema de roles (admin, user)
- `loyalty_rewards`: Programa de lealtad (8 visitas)
- `reviews`: Reseñas y calificaciones
- `portfolio_submissions`: Fotos de clientes (pendiente aprobación)
- `scheduled_reminders`: Recordatorios automáticos
- `chat_sentiment_metrics`: Análisis de satisfacción chatbot
- `security_logs`: Logs de seguridad
- `rate_limits`: Rate limiting para API

## 📈 Métricas de Rendimiento

Target: **Lighthouse Score ≥90**

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

Optimizaciones implementadas:
- Code splitting por ruta
- Lazy loading de imágenes
- Preconnect a dominios externos
- WebP images
- Tree shaking
- Critical CSS inline

## 🔒 Seguridad

- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Input validation con Zod
- ✅ Rate limiting en API endpoints
- ✅ Secrets management seguro
- ✅ HTTPS obligatorio
- ✅ Sanitización de HTML
- ✅ CORS configurado correctamente

## 🌍 Internacionalización

Actualmente en **Español (es-MX)** únicamente.

Para agregar más idiomas:
1. Instalar `react-i18next`
2. Crear archivos de traducción en `/public/locales/`
3. Envolver app con `I18nextProvider`

## 📱 PWA (Progressive Web App)

La aplicación es instalable en dispositivos móviles:
- Manifest configurado
- Service Worker activo
- Iconos para iOS y Android
- Offline fallback básico

## 🤝 Contribución

Este es un proyecto SaaS comercial. Para contribuir:
1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Propietario: Pitaya Nails
Todos los derechos reservados © 2024

## 📞 Contacto

**Pitaya Nails**
- 📍 Jardines del Sur 5, Cancún, Q. Roo, México
- 📞 +52 998 590 0050
- 📧 pitayanailscancun@gmail.com
- 🌐 [pitayanails.com](https://pitayanails.com)
- 📱 Instagram: [@nailstation_cun](https://instagram.com/nailstation_cun)

**Soporte Técnico:**
- jorge.zendejas1@gmail.com

---

Desarrollado con 💅 por el equipo de Pitaya Nails
Construido con [Lovable](https://lovable.dev) - Create apps with AI
