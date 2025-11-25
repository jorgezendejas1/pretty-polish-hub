import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  position?: 'left' | 'right' | 'bottom';
}

export const BookingDrawer = ({
  isOpen,
  onClose,
  children,
  title = 'Reserva tu Cita',
  position = 'right',
}: BookingDrawerProps) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const slideVariants = {
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
    },
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
    },
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
    },
  };

  const positionClasses = {
    right: 'top-0 right-0 h-full w-full sm:w-[480px]',
    left: 'top-0 left-0 h-full w-full sm:w-[480px]',
    bottom: 'bottom-0 left-0 right-0 h-[80vh] max-h-[800px] rounded-t-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className={`fixed ${positionClasses[position]} bg-background shadow-2xl z-50 flex flex-col`}
            variants={prefersReducedMotion ? {} : slideVariants[position]}
            initial={prefersReducedMotion ? {} : 'initial'}
            animate={prefersReducedMotion ? {} : 'animate'}
            exit={prefersReducedMotion ? {} : 'exit'}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">{title}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};