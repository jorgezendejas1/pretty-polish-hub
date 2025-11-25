import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Calendar, Image, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const menuItems = [
  {
    title: 'Servicios',
    icon: Sparkles,
    items: [
      { name: 'Manicura', href: '/servicios?categoria=manicura', description: 'Cuidado completo de manos' },
      { name: 'Pedicura', href: '/servicios?categoria=pedicura', description: 'Tratamiento spa para pies' },
      { name: 'Nail Art', href: '/servicios?categoria=nail-art', description: 'Diseños personalizados' },
      { name: 'Esculturales', href: '/servicios?categoria=esculturales', description: 'Extensiones y acrílico' },
    ],
  },
  {
    title: 'Portafolio',
    icon: Image,
    items: [
      { name: 'Galería', href: '/portfolio', description: 'Nuestros mejores trabajos' },
      { name: 'Antes y Después', href: '/before-after', description: 'Transformaciones increíbles' },
    ],
  },
  {
    title: 'Reservas',
    icon: Calendar,
    items: [
      { name: 'Nueva Cita', href: '/servicios', description: 'Agenda tu visita' },
      { name: 'Mis Reservas', href: '/dashboard', description: 'Gestiona tus citas' },
    ],
  },
];

export const MegaMenu = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <nav className="relative">
      <ul className="flex items-center gap-8">
        {menuItems.map((menu) => (
          <li
            key={menu.title}
            className="relative"
            onMouseEnter={() => !prefersReducedMotion && setActiveMenu(menu.title)}
            onMouseLeave={() => !prefersReducedMotion && setActiveMenu(null)}
          >
            <button
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors group"
              onClick={() => setActiveMenu(activeMenu === menu.title ? null : menu.title)}
            >
              <menu.icon className="h-4 w-4" />
              <span className="font-medium">{menu.title}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${activeMenu === menu.title ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeMenu === menu.title && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-elegant p-4 z-50"
                >
                  <div className="space-y-2">
                    {menu.items.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block p-3 rounded-lg hover:bg-muted transition-colors group"
                        onClick={() => setActiveMenu(null)}
                      >
                        <div className="font-medium group-hover:text-primary transition-colors">
                          {item.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.description}
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
    </nav>
  );
};