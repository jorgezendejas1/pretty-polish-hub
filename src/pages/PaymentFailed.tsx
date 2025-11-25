import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, Home, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const bookingId = searchParams.get('booking_id');

  const handleRetry = () => {
    // Navigate back to booking flow or payment
    navigate('/');
  };

  const handleContactSupport = () => {
    const message = encodeURIComponent(
      `Hola, tuve un problema con el pago de mi reserva. ID: ${bookingId || 'N/A'}`
    );
    window.open(
      `https://wa.me/5219985900050?text=${message}`,
      '_blank'
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <CardTitle className="text-3xl font-display">
            Pago No Completado
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            El proceso de pago no pudo ser completado
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {bookingId && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID de Reserva:</span>
                <span className="font-mono text-sm">{bookingId.substring(0, 20)}...</span>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">¿Qué sucedió?</h3>
            <div className="space-y-3 text-muted-foreground">
              <p className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>El pago fue cancelado o no se completó correctamente</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>No se realizó ningún cargo a tu tarjeta</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Tu reserva no ha sido confirmada</span>
              </p>
            </div>
          </div>

          <Separator />

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
              Posibles Razones:
            </h4>
            <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
              <li>• Cancelaste el pago antes de completarlo</li>
              <li>• Hubo un problema con tu método de pago</li>
              <li>• La sesión de pago expiró</li>
              <li>• Problemas de conexión a internet</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">¿Qué puedes hacer?</h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleRetry} 
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Intentar Nuevamente
              </Button>
              <Button 
                onClick={handleContactSupport}
                variant="outline" 
                className="flex-1"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Contactar Soporte
              </Button>
            </div>

            <Button 
              onClick={() => navigate('/')} 
              variant="ghost"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </div>

          <Separator />

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>💡 Tip:</strong> Asegúrate de que tu método de pago tenga fondos suficientes y que los datos de tu tarjeta sean correctos. Si el problema persiste, contáctanos por WhatsApp.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
