# 💅 Pitaya Nails UI Kit

Sistema de componentes React + Tailwind CSS reutilizables con animaciones premium, diseñado para crear experiencias ultra-premium en aplicaciones de salones de belleza.

## 📦 Instalación

Estos componentes están diseñados para usar con el stack de Pitaya Nails:
- React 18+
- TypeScript
- Tailwind CSS
- Framer Motion
- GSAP (opcional para AnimatedHero)

```bash
npm install framer-motion gsap
```

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

### 1. 🗂️ MegaMenu

Menú de navegación expandido con mega dropdown, categorías organizadas y enlaces destacados.

**Características:**
- Multi-nivel con categorías
- Iconos Lucide para cada sección
- Responsive (colapsa en hamburger en mobile)
- Hover states con animaciones

**Props:**
```tsx
interface MegaMenuProps {
  // No props requeridos - todo configurado internamente
}
```

**Uso:**
```tsx
import { MegaMenu } from '@/ui-kit/MegaMenu';

function Header() {
  return <MegaMenu />;
}
```

**Personalización:**
Edita las categorías en el componente directamente:
```tsx
const categories = [
  {
    title: 'Servicios',
    icon: Sparkles,
    items: [
      { name: 'Manicura', href: '/servicios#manicura' },
      { name: 'Pedicura', href: '/servicios#pedicura' },
    ]
  }
];
```

---

### 2. 🎬 AnimatedHero

Hero section épico con animaciones GSAP, soporte para video background o Lottie animations, y efectos parallax.

**Características:**
- Timeline GSAP con stagger animations
- Soporte video MP4 o Lottie JSON
- Parallax scroll effect
- Respeta `prefers-reduced-motion`

**Props:**
```tsx
interface AnimatedHeroProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
  mediaType?: 'video' | 'lottie';
  mediaSrc?: string;
}
```

**Uso Básico:**
```tsx
import { AnimatedHero } from '@/ui-kit/AnimatedHero';

<AnimatedHero 
  title="Bienvenido a Pitaya Nails"
  subtitle="Donde el arte se encuentra con la belleza"
  ctaText="Reservar Cita"
  ctaLink="#reservar"
/>
```

**Con Video Background:**
```tsx
<AnimatedHero 
  title="Tu Salón de Confianza"
  subtitle="Experiencia premium en Cancún"
  mediaType="video"
  mediaSrc="/videos/hero-background.mp4"
  ctaText="Ver Servicios"
  ctaLink="/servicios"
/>
```

**Con Lottie Animation:**
```tsx
<AnimatedHero 
  title="Nail Art Profesional"
  subtitle="Diseños únicos para ti"
  mediaType="lottie"
  mediaSrc="/animations/nails.json"
/>
```

---

### 3. 🃏 TiltCard

Card interactivo con efecto 3D tilt en hover, perfecto para mostrar servicios o portfolio.

**Características:**
- Efecto 3D parallax en mouse move
- Glare effect con gradiente
- Transform 3D con perspective
- Suavizado con springs

**Props:**
```tsx
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}
```

**Uso:**
```tsx
import { TiltCard } from '@/ui-kit/TiltCard';

<TiltCard>
  <div className="p-6">
    <h3 className="text-xl font-bold">Manicura Premium</h3>
    <p className="text-muted-foreground">Desde $450 MXN</p>
  </div>
</TiltCard>
```

**Ejemplo Completo:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {services.map(service => (
    <TiltCard key={service.id}>
      <img src={service.image} alt={service.name} />
      <div className="p-4">
        <h4>{service.name}</h4>
        <p>{service.description}</p>
        <Button>Reservar</Button>
      </div>
    </TiltCard>
  ))}
</div>
```

---

### 4. 🖼️ BeforeAfterGallery

Galería interactiva con slider comparador before/after, ideal para mostrar transformaciones.

**Características:**
- Slider arrastrable
- Comparación side-by-side
- Labels "Antes" y "Después"
- Touch-friendly para mobile

**Props:**
```tsx
interface BeforeAfterGalleryProps {
  beforeSrc: string;
  afterSrc: string;
  title?: string;
  description?: string;
}
```

**Uso:**
```tsx
import { BeforeAfterGallery } from '@/ui-kit/BeforeAfterGallery';

<BeforeAfterGallery 
  beforeSrc="/images/before-1.jpg"
  afterSrc="/images/after-1.jpg"
  title="Transformación Completa"
  description="Uñas acrílicas con nail art personalizado"
/>
```

**Grid de Transformaciones:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {transformations.map(item => (
    <BeforeAfterGallery
      key={item.id}
      beforeSrc={item.before}
      afterSrc={item.after}
      title={item.title}
    />
  ))}
</div>
```

---

### 5. 🏷️ PremiumBadge

Badges elegantes con gradientes, animaciones y múltiples variantes.

**Características:**
- 3 variantes: primary, secondary, accent
- Gradientes suaves
- Animaciones de pulse y glow
- Tamaños configurables

**Props:**
```tsx
interface PremiumBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Variantes:**
```tsx
import { PremiumBadge } from '@/ui-kit/PremiumBadge';

<PremiumBadge variant="primary">Nuevo</PremiumBadge>
<PremiumBadge variant="secondary">Popular</PremiumBadge>
<PremiumBadge variant="accent">Oferta</PremiumBadge>
```

**Tamaños:**
```tsx
<PremiumBadge size="sm">Pequeño</PremiumBadge>
<PremiumBadge size="md">Mediano</PremiumBadge>
<PremiumBadge size="lg">Grande</PremiumBadge>
```

**Uso en Cards:**
```tsx
<div className="relative">
  <PremiumBadge 
    variant="accent" 
    className="absolute top-4 right-4"
  >
    -20% OFF
  </PremiumBadge>
  <ServiceCard service={service} />
</div>
```

---

### 6. 📱 BookingDrawer

Drawer lateral deslizable optimizado para flujo de reserva en mobile, con animaciones fluidas.

**Características:**
- Slide-in desde derecha
- Overlay con blur
- Scroll interno independiente
- Close on outside click
- Animated transitions

**Props:**
```tsx
interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}
```

**Uso Básico:**
```tsx
import { BookingDrawer } from '@/ui-kit/BookingDrawer';
import { useState } from 'react';

function BookingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Reservar Ahora
      </Button>
      
      <BookingDrawer 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Nueva Reserva"
      >
        <BookingFlow onComplete={() => setIsOpen(false)} />
      </BookingDrawer>
    </>
  );
}
```

**Multi-Step Form:**
```tsx
<BookingDrawer isOpen={open} onClose={handleClose}>
  <div className="space-y-6">
    <StepIndicator current={step} total={4} />
    
    {step === 1 && <ServiceSelection />}
    {step === 2 && <ProfessionalSelection />}
    {step === 3 && <DateTimeSelection />}
    {step === 4 && <ClientInfo />}
    
    <NavigationButtons 
      onBack={handleBack}
      onNext={handleNext}
    />
  </div>
</BookingDrawer>
```

## 🎬 Sistema de Animaciones

### Framer Motion (Principal)

**Transiciones de Página:**
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {/* Contenido */}
</motion.div>
```

**Stagger Children:**
```tsx
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

**Gestos y Drag:**
```tsx
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300 }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Arrastra o haz click
</motion.div>
```

### GSAP (Animaciones Complejas)

**Timeline para Hero:**
```tsx
import gsap from 'gsap';
import { useEffect, useRef } from 'react';

function HeroAnimation() {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.from(titleRef.current, {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    })
    .from(subtitleRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.5');
  }, []);

  return (
    <>
      <h1 ref={titleRef}>Título</h1>
      <p ref={subtitleRef}>Subtítulo</p>
    </>
  );
}
```

**Scroll Triggers:**
```tsx
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

gsap.from('.fade-in', {
  scrollTrigger: {
    trigger: '.fade-in',
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse'
  },
  opacity: 0,
  y: 50,
  duration: 1
});
```

### Prefers Reduced Motion (Accesibilidad)

**CRÍTICO**: Todos los componentes deben respetar la preferencia del usuario.

**Implementación:**
```tsx
import { useEffect, useState } from 'react';

function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Uso
function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={{
        opacity: 1,
        y: prefersReducedMotion ? 0 : 20
      }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.5
      }}
    >
      Contenido
    </motion.div>
  );
}
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