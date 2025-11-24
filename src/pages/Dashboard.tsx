import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, DollarSign, User, Mail, Phone, ArrowLeft, Shield, Edit, X, CheckCircle, Info } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { AdminStats } from '@/components/AdminStats';
import { ReviewDialog } from '@/components/ReviewDialog';
import { ExportReportButton } from '@/components/ExportReportButton';
import { PortfolioUpload } from '@/components/PortfolioUpload';
import { PortfolioApproval } from '@/components/PortfolioApproval';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { LoyaltyCard } from '@/components/LoyaltyCard';
import { Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Componente helper para cargar imágenes con fallback
const ImageWithFallback = ({ imagePath, alt }: { imagePath: string | null; alt: string }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      if (!imagePath) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.storage
          .from('design-inspirations')
          .createSignedUrl(imagePath, 3600);

        if (error) throw error;
        if (data) setImageUrl(data.signedUrl);
      } catch (error) {
        console.error('Error loading image:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [imagePath]);

  if (loading) {
    return <div className="w-full h-48 bg-muted animate-pulse rounded-lg" />;
  }

  if (!imageUrl) {
    return <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">Imagen no disponible</div>;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className="w-full h-auto rounded-lg object-cover"
    />
  );
};

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_names: string[];
  professional_name: string;
  booking_date: string;
  booking_time: string;
  total_price: number;
  total_duration: number;
  status: string;
  created_at: string;
  inspiration_images: string[];
}

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newTime, setNewTime] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadBookings();
  }, []);

  const checkAuthAndLoadBookings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Acceso denegado',
          description: 'Debes iniciar sesión para ver tu dashboard',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      const email = session.user.email || '';
      setUserEmail(email);

      // Verificar si es admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      const adminStatus = !!roleData;
      setIsAdmin(adminStatus);

      // Cargar reservas según el rol
      if (adminStatus) {
        // Admin ve todas las reservas
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('booking_date', { ascending: false })
          .order('booking_time', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } else {
        // Usuario normal ve solo sus reservas
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('client_email', email)
          .order('booking_date', { ascending: false })
          .order('booking_time', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las reservas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Reserva cancelada',
        description: 'La reserva ha sido cancelada exitosamente',
      });

      checkAuthAndLoadBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cancelar la reserva',
        variant: 'destructive',
      });
    }
  };

  const handleRescheduleBooking = async () => {
    if (!editingBooking || !newDate || !newTime) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_date: format(newDate, 'yyyy-MM-dd'),
          booking_time: newTime,
        })
        .eq('id', editingBooking.id);

      if (error) throw error;

      toast({
        title: 'Reserva reprogramada',
        description: 'La reserva ha sido actualizada exitosamente',
      });

      setEditingBooking(null);
      setNewDate(undefined);
      setNewTime('');
      checkAuthAndLoadBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo reprogramar la reserva',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Estado actualizado',
        description: `La reserva ha sido marcada como ${newStatus === 'completed' ? 'completada' : newStatus === 'confirmed' ? 'confirmada' : newStatus === 'cancelled' ? 'cancelada' : 'pendiente'}`,
      });

      checkAuthAndLoadBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'default',
      confirmed: 'default',
      cancelled: 'destructive',
      completed: 'secondary',
    };

    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const availableTimes = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
            {isAdmin && (
              <>
                <Badge className="gradient-primary text-white">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrador
                </Badge>
                <ExportReportButton />
              </>
            )}
          </div>
        </div>

        {isAdmin && <AdminStats />}

        {!isAdmin && <LoyaltyCard />}

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="bookings">Reservas</TabsTrigger>
            {!isAdmin && <TabsTrigger value="portfolio">Subir Fotos</TabsTrigger>}
            {isAdmin && <TabsTrigger value="portfolio-approval">Aprobar Fotos</TabsTrigger>}
            {isAdmin && <TabsTrigger value="analytics">Analíticas</TabsTrigger>}
          </TabsList>

          <TabsContent value="bookings">
            {isAdmin && (
              <Alert className="mb-6 border-primary/20 bg-primary/5">
                <Info className="h-4 w-4" />
                <AlertTitle>Sistema Automático de Estados Activo</AlertTitle>
                <AlertDescription className="space-y-2 text-sm">
                  <p>El sistema actualiza automáticamente los estados de las reservas cada hora:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Completado automáticamente:</strong> 2 horas después de la hora programada de la cita</li>
                    <li><strong>Cancelado automáticamente:</strong> Si la reserva sigue en "Pendiente" 24 horas antes de la cita</li>
                    <li><strong>Notificación de reseña:</strong> Se envía automáticamente cuando una cita se marca como completada</li>
                    <li><strong>Programa de lealtad:</strong> Se actualiza automáticamente al completarse una cita (trigger en base de datos)</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">
                    Puedes cambiar el estado manualmente usando el selector desplegable en la columna "Estado" si es necesario.
                  </p>
                </AlertDescription>
              </Alert>
            )}
            <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {isAdmin ? 'Panel de Administración - Todas las Reservas' : 'Mis Reservas'}
            </CardTitle>
            {!isAdmin && (
              <p className="text-muted-foreground">
                Cuenta: {userEmail}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {isAdmin ? 'No hay reservas en el sistema' : 'No tienes reservas'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isAdmin 
                    ? 'Aún no se han realizado reservas en el sistema.' 
                    : 'Aún no has realizado ninguna reserva con nosotros.'
                  }
                </p>
                {!isAdmin && (
                  <Button onClick={() => navigate('/#servicios')} className="gradient-primary text-white">
                    Ver Servicios
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {isAdmin && <TableHead>Cliente</TableHead>}
                      {isAdmin && <TableHead>Contacto</TableHead>}
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Servicios</TableHead>
                      <TableHead>Profesional</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  {isAdmin && <TableHead>Imágenes</TableHead>}
                  <TableHead>Acciones</TableHead>
                </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{booking.client_name}</span>
                            </div>
                          </TableCell>
                        )}
                        {isAdmin && (
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {booking.client_email}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {booking.client_phone}
                              </div>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(booking.booking_date), 'dd MMM yyyy', { locale: es })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {booking.booking_time}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {booking.service_names.join(', ')}
                          </div>
                        </TableCell>
                        <TableCell>{booking.professional_name}</TableCell>
                        <TableCell>{booking.total_duration} min</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-semibold">
                            <DollarSign className="h-4 w-4" />
                            {booking.total_price}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(booking.status)}
                            {isAdmin && (
                              <Select
                                value={booking.status}
                                onValueChange={(value) => handleStatusChange(booking.id, value)}
                              >
                                <SelectTrigger className="w-[140px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pendiente</SelectItem>
                                  <SelectItem value="confirmed">Confirmada</SelectItem>
                                  <SelectItem value="completed">Completada</SelectItem>
                                  <SelectItem value="cancelled">Cancelada</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            {booking.inspiration_images && booking.inspiration_images.length > 0 ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="secondary" size="sm">
                                    Ver {booking.inspiration_images.length} Foto(s)
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Imágenes de Inspiración</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid grid-cols-2 gap-4 p-4">
                                    {booking.inspiration_images.map((url: string, idx: number) => {
                                      const pathMatch = url.match(/design-inspirations\/(.+)/);
                                      const imagePath = pathMatch ? pathMatch[1] : null;
                                      
                                      return (
                                        <ImageWithFallback
                                          key={idx}
                                          imagePath={imagePath}
                                          alt={`Inspiración ${idx + 1}`}
                                        />
                                      );
                                    })}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex gap-2">
                            {booking.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setReviewDialogOpen(true);
                                }}
                                className="gap-1"
                              >
                                <Star className="h-4 w-4" />
                                Calificar
                              </Button>
                            )}
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingBooking(booking);
                                        setNewDate(new Date(booking.booking_date));
                                        setNewTime(booking.booking_time);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reprogramar Cita</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div>
                                        <Label>Nueva Fecha</Label>
                                        <CalendarComponent
                                          mode="single"
                                          selected={newDate}
                                          onSelect={setNewDate}
                                          disabled={(date) => date < new Date()}
                                          locale={es}
                                          className="rounded-md border mx-auto mt-2"
                                        />
                                      </div>
                                      <div>
                                        <Label>Nueva Hora</Label>
                                        <div className="grid grid-cols-4 gap-2 mt-2">
                                          {availableTimes.map((time) => (
                                            <Button
                                              key={time}
                                              size="sm"
                                              variant={newTime === time ? 'default' : 'outline'}
                                              onClick={() => setNewTime(time)}
                                            >
                                              {time}
                                            </Button>
                                          ))}
                                        </div>
                                      </div>
                                      <Button
                                        onClick={handleRescheduleBooking}
                                        disabled={!newDate || !newTime}
                                        className="w-full"
                                      >
                                        Confirmar Cambios
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
                                      handleCancelBooking(booking.id);
                                    }
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        </TabsContent>

        {!isAdmin && (
          <TabsContent value="portfolio">
            <PortfolioUpload />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="portfolio-approval">
            <PortfolioApproval />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        )}
      </Tabs>
        
        {selectedBooking && (
          <ReviewDialog
            isOpen={reviewDialogOpen}
            onClose={() => {
              setReviewDialogOpen(false);
              setSelectedBooking(null);
            }}
            bookingId={selectedBooking.id}
            clientEmail={selectedBooking.client_email}
            clientName={selectedBooking.client_name}
          />
        )}
      </div>
    </div>
  );
}