# ✅ Pitaya Nails - Checklist de Quality Assurance

## 📋 Tabla de Contenidos

- [Booking Flow](#booking-flow)
- [Mobile Responsiveness](#mobile-responsiveness)
- [Accesibilidad](#accesibilidad)
- [Performance](#performance)
- [SEO](#seo)
- [Seguridad](#seguridad)
- [Funcionalidades Backend](#funcionalidades-backend)
- [Integraciones](#integraciones)
- [Cross-Browser Testing](#cross-browser-testing)

---

## 🗓️ Booking Flow

### Paso 1: Selección de Servicios
- [ ] Los servicios se muestran categorizados correctamente
- [ ] Las imágenes de servicios cargan correctamente
- [ ] Los precios y duraciones se muestran claramente
- [ ] Se pueden seleccionar múltiples servicios
- [ ] Los paquetes con descuento se distinguen visualmente
- [ ] El servicio "Nail Art Personalizado" permite especificar cantidad de uñas
- [ ] El total se actualiza al agregar/quitar servicios
- [ ] El botón "Continuar" solo se habilita con al menos 1 servicio seleccionado

**Resultado Esperado**: ✅ Usuario puede seleccionar servicios sin errores

### Paso 2: Selección de Profesional
- [ ] Se muestran todas las profesionales con sus fotos
- [ ] Se muestra la especialidad de cada profesional
- [ ] Solo se puede seleccionar una profesional a la vez
- [ ] La profesional seleccionada se resalta visualmente
- [ ] El botón "Continuar" solo se habilita con profesional seleccionada

**Resultado Esperado**: ✅ Usuario puede elegir profesional sin problemas

### Paso 3: Selección de Fecha y Hora
- [ ] El calendario muestra el mes actual por defecto
- [ ] Los domingos están deshabilitados (salón cerrado)
- [ ] No se pueden seleccionar fechas pasadas
- [ ] Al seleccionar fecha, se cargan horarios disponibles
- [ ] Los horarios ocupados no aparecen como opcionales
- [ ] Los horarios consideran la duración total de servicios seleccionados
- [ ] Si selecciono 90min de servicios, no se muestran slots que terminarían después de cierre (9pm)
- [ ] El horario seleccionado se resalta
- [ ] Se muestra claramente fecha y hora seleccionadas

**Resultado Esperado**: ✅ Sistema muestra disponibilidad real y bloquea slots ocupados

### Paso 4: Información del Cliente
- [ ] Campos requeridos están marcados con asterisco (*)
- [ ] Validación de email funciona (formato válido)
- [ ] Validación de teléfono funciona (formato +52 xxx xxx xxxx)
- [ ] Opción de recordatorios por email es opcional
- [ ] Opción de recordatorios por SMS es opcional
- [ ] Se puede subir imágenes de inspiración (opcional)
- [ ] Las imágenes se previsualizar antes de enviar
- [ ] Límite de tamaño de imagen se respeta (< 5MB)
- [ ] Botón "Confirmar Reserva" se habilita solo con datos válidos

**Resultado Esperado**: ✅ Validación previene datos incorrectos

### Paso 5: Confirmación
- [ ] Se muestra resumen completo de la reserva
- [ ] Servicios, profesional, fecha, hora y precio total son correctos
- [ ] El token de reserva se genera correctamente
- [ ] Se envía email de confirmación al cliente
- [ ] Se envía email CC a administradores
- [ ] Se crea notificación en WhatsApp con mensaje pre-llenado
- [ ] La reserva aparece en el dashboard del cliente (si está autenticado)
- [ ] La reserva aparece en el dashboard de admin
- [ ] El slot queda bloqueado para otras reservas

**Resultado Esperado**: ✅ Reserva confirmada y registrada correctamente

### Flujo Sin Autenticación
- [ ] Usuario no autenticado puede completar reserva
- [ ] Los datos se guardan en la base de datos
- [ ] Se envían notificaciones correctamente
- [ ] No se requiere login para reservar

**Resultado Esperado**: ✅ Reserva funciona para usuarios anónimos

### Flujo Con Autenticación
- [ ] Usuario autenticado ve sus reservas en dashboard
- [ ] Historial de visitas se actualiza automáticamente
- [ ] Programa de lealtad se incrementa en cada visita completada
- [ ] Al llegar a 8 visitas, se otorga recompensa gratuita

**Resultado Esperado**: ✅ Beneficios de lealtad funcionan correctamente

---

## 📱 Mobile Responsiveness

### Diseño General
- [ ] Layout se adapta a pantallas pequeñas (< 375px)
- [ ] No hay scroll horizontal en ninguna página
- [ ] Textos son legibles sin zoom
- [ ] Botones tienen tamaño táctil adecuado (mínimo 44x44px)
- [ ] Espaciado entre elementos táctiles es suficiente

### Navegación Móvil
- [ ] Menú hamburguesa funciona correctamente
- [ ] Mega menu se colapsa en móvil
- [ ] Links de navegación son fáciles de tocar
- [ ] Botón de WhatsApp flotante no obstruye contenido
- [ ] Sticky CTA de reserva es visible en mobile

### Páginas Específicas

#### Homepage
- [ ] Hero se ve correctamente en móvil
- [ ] Imágenes de servicios se adaptan
- [ ] Galería de portfolio es navegable con touch
- [ ] Testimonios son legibles
- [ ] Mapa interactivo funciona en táctil

#### Servicios
- [ ] Cards de servicios se apilan verticalmente
- [ ] Imágenes mantienen aspect ratio
- [ ] Botón "Reservar" siempre visible

#### Dashboard
- [ ] Tabla de reservas se hace scroll horizontal responsivo
- [ ] Botones de acción son táctiles
- [ ] Modal de reprogramación se adapta a móvil
- [ ] Calendario se ve completo

#### Booking Flow
- [ ] Pasos se muestran de forma compacta
- [ ] Selector de servicios es usable en touch
- [ ] Calendario es navegable en móvil
- [ ] Grid de horarios se ajusta a pantalla pequeña

### Chatbot Móvil
- [ ] Botón de chatbot no obstruye contenido
- [ ] Ventana de chat se adapta a móvil
- [ ] Teclado no oculta mensajes
- [ ] Quick replies son táctiles
- [ ] Scroll funciona correctamente

**Resultado Esperado**: ✅ App completamente funcional en dispositivos móviles

---

## ♿ Accesibilidad (WCAG 2.1 AA)

### Teclado
- [ ] Toda la navegación es posible solo con teclado
- [ ] Tab order es lógico y secuencial
- [ ] Focus visible en todos los elementos interactivos
- [ ] No hay keyboard traps
- [ ] Atajos de teclado no interfieren con lectores de pantalla

### Lectores de Pantalla
- [ ] ARIA labels en botones sin texto visible
- [ ] ARIA live regions para notificaciones dinámicas
- [ ] Roles semánticos correctos (button, nav, main, etc.)
- [ ] Landmark regions definidas
- [ ] Alt text descriptivo en todas las imágenes

### Contraste de Color
- [ ] Ratio de contraste ≥4.5:1 para texto normal
- [ ] Ratio de contraste ≥3:1 para texto grande
- [ ] Botones tienen suficiente contraste
- [ ] Links son distinguibles del texto normal

### Formularios
- [ ] Labels asociados correctamente con inputs
- [ ] Mensajes de error son descriptivos
- [ ] Errores se anuncian a lectores de pantalla
- [ ] Placeholder text no reemplaza labels
- [ ] Required fields están marcados

### Multimedia
- [ ] Videos tienen controles accesibles
- [ ] Animaciones respetan prefers-reduced-motion
- [ ] No hay contenido que parpadee > 3 veces/segundo

### Testing Tools
- [ ] axe DevTools: 0 errores críticos
- [ ] WAVE: 0 errores
- [ ] Lighthouse Accessibility: Score ≥95

**Resultado Esperado**: ✅ WCAG 2.1 AA compliant

---

## ⚡ Performance

### Métricas Core Web Vitals
- [ ] **LCP** (Largest Contentful Paint): < 2.5s
- [ ] **FID** (First Input Delay): < 100ms
- [ ] **CLS** (Cumulative Layout Shift): < 0.1
- [ ] **INP** (Interaction to Next Paint): < 200ms

### Lighthouse Scores (Target ≥90)
- [ ] Performance: ___ / 100
- [ ] Accessibility: ___ / 100
- [ ] Best Practices: ___ / 100
- [ ] SEO: ___ / 100

### Optimizaciones de Imágenes
- [ ] Imágenes en formato WebP
- [ ] Lazy loading activado
- [ ] Imágenes responsivas (srcset)
- [ ] LQIP (Low Quality Image Placeholder) en uso
- [ ] Imágenes críticas tienen preload

### Optimizaciones de Código
- [ ] Code splitting por ruta
- [ ] Tree shaking elimina código no usado
- [ ] Vendor chunks separados (React, UI, Supabase)
- [ ] CSS crítico inline
- [ ] Fonts locales o preload

### Optimizaciones de Red
- [ ] Preconnect a dominios externos
- [ ] DNS-prefetch configurado
- [ ] Caching headers correctos
- [ ] Gzip/Brotli compression activado
- [ ] CDN configurado (Vercel/Cloudflare)

### Bundle Size
- [ ] Bundle inicial < 200KB (gzipped)
- [ ] Async chunks < 100KB cada uno
- [ ] No hay dependencias duplicadas

**Resultado Esperado**: ✅ Lighthouse Performance ≥90

---

## 🔍 SEO

### Meta Tags
- [ ] Title único por página (< 60 caracteres)
- [ ] Meta description única por página (< 160 caracteres)
- [ ] Canonical URL definido
- [ ] Open Graph tags (og:title, og:description, og:image)
- [ ] Twitter Card tags
- [ ] Viewport meta tag presente
- [ ] Charset UTF-8 declarado

### Structured Data (JSON-LD)
- [ ] Schema LocalBusiness implementado
- [ ] Schema Organization presente
- [ ] Schema Service para servicios
- [ ] Schema WebSite con siteName
- [ ] Schema BreadcrumbList en rutas anidadas
- [ ] Validado con [Google Rich Results Test](https://search.google.com/test/rich-results)

### Sitemap & Robots
- [ ] sitemap.xml generado y accesible
- [ ] robots.txt configurado correctamente
- [ ] URLs importantes incluidas en sitemap
- [ ] Rutas privadas bloqueadas en robots.txt

### Contenido
- [ ] Headings jerárquicos (H1 → H2 → H3)
- [ ] Solo un H1 por página
- [ ] Keywords relevantes en títulos y descripciones
- [ ] URLs semánticas y limpias
- [ ] Alt text descriptivo en imágenes

### Performance SEO
- [ ] HTTPS activo
- [ ] Mobile-friendly (Google Mobile-Friendly Test)
- [ ] No errores 404 en navegación principal
- [ ] Redirecciones correctas (301 vs 302)

### Local SEO
- [ ] NAP (Name, Address, Phone) consistente
- [ ] Google My Business integrado
- [ ] LocalBusiness schema con geo coordinates
- [ ] Hreflang tags (si multiidioma)

**Resultado Esperado**: ✅ SEO optimizado para buscadores

---

## 🔒 Seguridad

### Autenticación
- [ ] Passwords se hashean (nunca plain text)
- [ ] Login requiere email + password válidos
- [ ] Sessions expiran correctamente
- [ ] Logout limpia session correctamente
- [ ] No se exponen tokens en localStorage (si se usan)
- [ ] Auto-confirm emails desactivado en producción

### Autorización (RLS Policies)
- [ ] Usuarios solo ven sus propias reservas
- [ ] Admins ven todas las reservas
- [ ] Tabla `bookings` tiene RLS enabled
- [ ] Tabla `profiles` tiene RLS enabled
- [ ] Tabla `user_roles` tiene RLS enabled
- [ ] Tabla `reviews` tiene RLS enabled
- [ ] Tabla `portfolio_submissions` tiene RLS enabled
- [ ] Tabla `loyalty_rewards` tiene RLS enabled

### Input Validation
- [ ] Todos los forms tienen validación Zod
- [ ] SQL injection prevenido (queries parametrizadas)
- [ ] XSS prevenido (sanitización de HTML)
- [ ] CSRF tokens en forms críticos
- [ ] Rate limiting en endpoints públicos
- [ ] File uploads validados (tipo, tamaño)

### API Security
- [ ] CORS configurado correctamente
- [ ] API keys no expuestos en frontend
- [ ] Secrets almacenados en variables de entorno
- [ ] Edge functions con autenticación
- [ ] Rate limiting activo

### Testing
- [ ] Intentar acceder a rutas admin sin autenticación → 401
- [ ] Intentar modificar reserva de otro usuario → 403
- [ ] Intentar SQL injection en búsquedas → Bloqueado
- [ ] Intentar XSS en comentarios → Sanitizado

**Resultado Esperado**: ✅ Sin vulnerabilidades críticas

---

## 🔧 Funcionalidades Backend

### Edge Functions
- [ ] `chat`: Chatbot responde correctamente
- [ ] `create-booking`: Crea reservas sin errores
- [ ] `send-booking-confirmation`: Envía emails
- [ ] `send-reminders`: Envía recordatorios 24h antes
- [ ] `update-booking-status`: Cambia estado automáticamente
- [ ] `manage-booking`: Permite cancelar/reagendar
- [ ] `notify-admins-reward`: Notifica recompensa de lealtad
- [ ] `generate-analytics`: Genera métricas AI
- [ ] Todas las funciones tienen logs
- [ ] Todas las funciones manejan errores correctamente

### Database Triggers
- [ ] `handle_new_user`: Crea profile automáticamente
- [ ] `create_automatic_reminder`: Crea recordatorio al reservar
- [ ] `increment_loyalty_visits`: Incrementa visitas al completar cita
- [ ] `update_chat_sentiment_updated_at`: Actualiza timestamp

### Automatizaciones
- [ ] Cron job de recordatorios (cada hora)
- [ ] Cambio automático a "completed" 2h después de cita
- [ ] Cambio automático a "cancelled" si no se confirma 24h antes
- [ ] Email de reseña al completarse cita
- [ ] Notificación admin en nueva reserva

### Realtime Subscriptions
- [ ] Notificaciones admin en tiempo real
- [ ] Calendario admin actualiza automáticamente
- [ ] Dashboard cliente actualiza en tiempo real

**Resultado Esperado**: ✅ Backend funciona end-to-end

---

## 🔗 Integraciones

### Email (Resend)
- [ ] Email de confirmación llega al cliente
- [ ] Email CC llega a ambos admins
- [ ] Email de recordatorio llega 24h antes
- [ ] Email de reseña llega al completarse cita
- [ ] Template de emails es responsive
- [ ] Emails no caen en spam

### WhatsApp Business API
- [ ] Mensaje pre-llenado se genera correctamente
- [ ] Link de WhatsApp abre la app/web
- [ ] Número +52 998 590 0050 es correcto
- [ ] Botón flotante de WhatsApp visible en todas las páginas

### Lovable AI
- [ ] Chatbot "Pita" responde en español
- [ ] Pita consulta disponibilidad real de la BD
- [ ] Pita puede crear reservas completas
- [ ] Pita responde preguntas sobre servicios
- [ ] Análisis de sentimiento funciona
- [ ] Predicciones de demanda generan insights

### Maps (React Leaflet)
- [ ] Mapa muestra ubicación correcta
- [ ] Marker es interactivo
- [ ] Popup con información del salón
- [ ] Zoom y pan funcionan
- [ ] Dirección clickeable abre Google Maps

**Resultado Esperado**: ✅ Todas las integraciones operativas

---

## 🌐 Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome (última versión)
- [ ] Firefox (última versión)
- [ ] Safari (macOS)
- [ ] Edge (última versión)

### Mobile Browsers
- [ ] Safari iOS (iPhone)
- [ ] Chrome Android
- [ ] Samsung Internet

### Compatibility Issues
- [ ] CSS Grid funciona en todos los browsers
- [ ] Flexbox funciona correctamente
- [ ] Web Vitals se reportan correctamente
- [ ] Service Worker se registra
- [ ] LocalStorage funciona
- [ ] Fetch API disponible

**Resultado Esperado**: ✅ Funciona en browsers modernos (últimas 2 versiones)

---

## 📊 Resumen de Testing

### Status por Categoría

| Categoría | Status | Prioridad | Responsable |
|-----------|--------|-----------|-------------|
| Booking Flow | ⬜ Pendiente | 🔴 Alta | QA Team |
| Mobile | ⬜ Pendiente | 🔴 Alta | QA Team |
| Accesibilidad | ⬜ Pendiente | 🟡 Media | QA Team |
| Performance | ⬜ Pendiente | 🔴 Alta | Dev Team |
| SEO | ⬜ Pendiente | 🟡 Media | Marketing |
| Seguridad | ⬜ Pendiente | 🔴 Alta | Security |
| Backend | ⬜ Pendiente | 🔴 Alta | Dev Team |
| Integraciones | ⬜ Pendiente | 🟡 Media | Dev Team |
| Cross-Browser | ⬜ Pendiente | 🟢 Baja | QA Team |

### Leyenda de Status
- ⬜ Pendiente
- 🟡 En Progreso
- ✅ Completado
- ❌ Fallido

### Bloqueadores Críticos (Debe Pasar Antes de Launch)
1. ❌ Booking flow completo sin errores
2. ❌ Mobile responsive en todas las páginas
3. ❌ Lighthouse Performance ≥90
4. ❌ Seguridad: RLS policies funcionando
5. ❌ Email confirmación funcionando

### Notas de Testing

```
Fecha: _______________
Tester: _______________
Environment: [ ] Staging [ ] Production
Device: _______________
Browser: _______________

Problemas Encontrados:
1. _________________________________
2. _________________________________
3. _________________________________

Severidad:
[ ] Critical - Bloquea launch
[ ] High - Debe arreglarse pronto
[ ] Medium - Nice to have
[ ] Low - Cosmético

Próximos Pasos:
_________________________________
_________________________________
```

---

## 🚀 Pre-Launch Checklist Final

- [ ] Todos los tests de QA pasaron
- [ ] Performance Lighthouse ≥90
- [ ] SEO optimizado y verificado
- [ ] Seguridad auditada
- [ ] Dominio personalizado conectado (pitayanails.com)
- [ ] SSL/HTTPS activo
- [ ] Emails funcionando en producción
- [ ] Analytics configurado
- [ ] Sitemap submitido a Google Search Console
- [ ] Backups de base de datos configurados
- [ ] Monitoreo de errores activo (Sentry opcional)
- [ ] Documentación completa entregada

**Sign-off:**

- [ ] QA Lead: ______________ Fecha: _____
- [ ] Tech Lead: ______________ Fecha: _____
- [ ] Product Owner: ______________ Fecha: _____

---

**Última Actualización**: 2024
**Versión**: 1.0
**Contacto**: jorge.zendejas1@gmail.com
