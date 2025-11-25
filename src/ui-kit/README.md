# Pitaya Nails UI Kit

Sistema de componentes reutilizables con animaciones premium para experiencia ultra-premium.

## 🎨 Design System

### Colores
- `--primary`: Color principal de marca
- `--secondary`: Color secundario
- `--accent`: Color de acento
- `--background`: Fondo
- `--foreground`: Texto sobre fondo

### Animaciones
Todas las animaciones respetan `prefers-reduced-motion` para accesibilidad.

## 📦 Componentes Disponibles

### 1. MegaMenu
Menú de navegación expandido con categorías y enlaces destacados.

```tsx
import { MegaMenu } from '@/ui-kit/MegaMenu';

<MegaMenu />
```

### 2. AnimatedHero
Hero section con animaciones GSAP, soporte para video/lottie y efectos parallax.

```tsx
import { AnimatedHero } from '@/ui-kit/AnimatedHero';

<AnimatedHero 
  title="Bienvenido"
  subtitle="Subtítulo"
  mediaType="video" // or "lottie"
  mediaSrc="/path/to/media"
/>
```

### 3. TiltCard
Card con efecto 3D tilt en hover.

```tsx
import { TiltCard } from '@/ui-kit/TiltCard';

<TiltCard>
  <h3>Título</h3>
  <p>Contenido</p>
</TiltCard>
```

### 4. BeforeAfterGallery
Galería con comparador before/after interactivo.

```tsx
import { BeforeAfterGallery } from '@/ui-kit/BeforeAfterGallery';

<BeforeAfterGallery 
  beforeSrc="/before.jpg"
  afterSrc="/after.jpg"
  title="Transformación"
/>
```

### 5. PremiumBadge
Badges con gradientes y animaciones.

```tsx
import { PremiumBadge } from '@/ui-kit/PremiumBadge';

<PremiumBadge variant="primary">Nuevo</PremiumBadge>
```

### 6. BookingDrawer
Drawer deslizante para proceso de reserva.

```tsx
import { BookingDrawer } from '@/ui-kit/BookingDrawer';

<BookingDrawer 
  isOpen={open}
  onClose={() => setOpen(false)}
>
  {/* Contenido */}
</BookingDrawer>
```

## 🎬 Animaciones

### Framer Motion
- Transiciones fluidas
- Gestos y drag
- AnimatePresence para enter/exit

### GSAP
- Timeline Hero
- Scroll triggers
- Animaciones complejas

### Prefers Reduced Motion
Todos los componentes detectan automáticamente la preferencia del usuario:

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

## 🚀 Performance

- Lazy loading de componentes pesados
- Optimización de animaciones con `will-change`
- Debounce en scroll events
- GPU acceleration con `transform3d`

## 📱 Responsive

Todos los componentes son mobile-first y optimizados para:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## ♿ Accesibilidad

- ARIA labels en todos los componentes interactivos
- Soporte completo de teclado
- Focus visible
- Respeto a prefers-reduced-motion
- Contraste de colores WCAG AA

## 🎨 Estilos

Sistema de diseño basado en:
- Tailwind CSS
- CSS Variables
- Design Tokens
- Semantic colors