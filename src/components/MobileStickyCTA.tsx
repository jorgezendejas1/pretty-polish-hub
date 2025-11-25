import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X } from 'lucide-react';
import { Button } from './ui/button';

export const MobileStickyCTA = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hide on services and dashboard pages
  const hiddenRoutes = ['/services', '/dashboard', '/auth', '/booking'];
  const shouldShow = !hiddenRoutes.some(route => location.pathname.includes(route)) && isVisible && isMobile;

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="bg-gradient-to-r from-primary to-secondary p-4 shadow-elegant">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">
                ¿Lista para tu cita?
              </p>
              <p className="text-white/90 text-xs">
                Reserva ahora en 2 minutos
              </p>
            </div>
            <Button
              onClick={() => navigate('/services')}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Reservar
            </Button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/80 hover:text-white p-1"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
