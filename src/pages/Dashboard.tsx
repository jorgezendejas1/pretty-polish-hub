import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DollarSign, User, Mail, Phone, ArrowLeft, Shield } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
            {isAdmin && (
              <Badge className="gradient-primary text-white">
                <Shield className="h-3 w-3 mr-1" />
                Administrador
              </Badge>
            )}
          </div>
        </div>

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
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        {isAdmin && (
                          <TableCell>
                            {booking.inspiration_images && booking.inspiration_images.length > 0 ? (
                              <Badge variant="secondary">
                                {booking.inspiration_images.length} imagen(es)
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}