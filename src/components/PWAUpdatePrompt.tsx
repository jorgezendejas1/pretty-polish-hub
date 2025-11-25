import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PWAUpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowPrompt(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      });
    }
    window.location.reload();
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-8 md:w-96"
        >
          <Card className="p-4 shadow-elegant border-2 border-primary/20 bg-card">
            <div className="flex items-start gap-3">
              <RefreshCw className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Nueva versión disponible</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Actualiza para disfrutar de las últimas mejoras
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdate}
                    size="sm"
                    className="gradient-primary text-white"
                  >
                    Actualizar ahora
                  </Button>
                  <Button
                    onClick={handleClose}
                    size="sm"
                    variant="outline"
                  >
                    Más tarde
                  </Button>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
