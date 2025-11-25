import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

export const StickyCTA = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Hide on booking/services pages to avoid redundancy
  const shouldShow = isMobile && !location.pathname.includes('/servicios');

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-background via-background to-transparent pointer-events-none"
        >
          <motion.div
            className="pointer-events-auto"
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => navigate('/servicios')}
              size="lg"
              className="w-full gradient-primary text-white shadow-glow hover:shadow-elegant transition-smooth text-base py-6"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Reserva tu Cita Ahora
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
