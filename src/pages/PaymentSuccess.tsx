import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, Download, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    // Trigger confetti animation
    const timer = setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      setBookingDetails(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    if (!bookingDetails) return;

    const receiptContent = `
PITAYA NAILS - RECIBO DE PAGO
================================

Fecha de Pago: ${new Date().toLocaleDateString('es-MX')}
ID de Sesión: ${sessionId}
ID de Reserva: ${bookingId}

DETALLES DE LA RESERVA
--------------------------------
Cliente: ${bookingDetails.client_name}
Email: ${bookingDetails.client_email}
Teléfono: ${bookingDetails.client_phone}

Fecha de Cita: ${format(new Date(bookingDetails.booking_date), 'dd/MM/yyyy', { locale: es })}
Hora: ${bookingDetails.booking_time}
Profesional: ${bookingDetails.professional_name}

Servicios:
${bookingDetails.service_names.map((name: string) => `  - ${name}`).join('\n')}

Duración Total: ${bookingDetails.total_duration} minutos
Total Pagado: $${bookingDetails.total_price.toFixed(2)} MXN

================================
Gracias por tu preferencia
Pitaya Nails
Jardines del Sur 5, Cancún, Q. Roo
+52 998 590 0050
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo-pitaya-${bookingId?.substring(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-display">
            ¡Pago Exitoso!
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Tu reserva ha sido confirmada y el pago procesado correctamente
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando detalles...</p>
            </div>
          ) : bookingDetails ? (
            <>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID de Sesión:</span>
                  <span className="font-mono text-sm">{sessionId?.substring(0, 20)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID de Reserva:</span>
                  <span className="font-mono text-sm">{bookingId?.substring(0, 20)}...</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Detalles de tu Reserva</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(bookingDetails.booking_date), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hora</p>
                    <p className="font-semibold">{bookingDetails.booking_time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profesional</p>
                    <p className="font-semibold">{bookingDetails.professional_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duración</p>
                    <p className="font-semibold">{bookingDetails.total_duration} min</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Servicios</p>
                  <ul className="space-y-1">
                    {bookingDetails.service_names.map((name: string, idx: number) => (
                      <li key={idx} className="text-sm">• {name}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Pagado</span>
                    <span className="text-2xl font-bold text-primary">
                      ${bookingDetails.total_price.toFixed(2)} MXN
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>📧 Confirmación Enviada:</strong> Hemos enviado un correo electrónico con todos los detalles de tu reserva a <strong>{bookingDetails.client_email}</strong>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={downloadReceipt} 
                  variant="outline" 
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Recibo
                </Button>
                <Button 
                  onClick={() => navigate('/')} 
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Volver al Inicio
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron detalles de la reserva</p>
              <Button onClick={() => navigate('/')} className="mt-4">
                Volver al Inicio
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
