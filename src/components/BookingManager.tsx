import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from './ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from './ui/drawer';
import { Calendar as CalendarIcon, Clock, DollarSign, User, X, Edit, AlertCircle } from 'lucide-react';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  service_names: string[];
  professional_name: string;
  professional_id?: string;
  total_price: number;
  total_duration: number;
  status: string;
  booking_token?: string;
}

export const BookingManager = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (newDate && selectedBooking) {
      generateAvailableTimes();
    }
  }, [newDate, selectedBooking]);

  const loadBookings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Load from localStorage for non-authenticated users
        const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
        setBookings(history.map((item: any) => ({
          id: item.id,
          booking_date: format(parse(item.date, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd'),
          booking_time: '10:00',
          service_names: item.services.map((s: any) => s.name),
          professional_name: item.professionalName,
          total_price: item.totalPrice,
          total_duration: item.totalDuration,
          status: 'pending',
          booking_token: item.booking_token,
        })));
        return;
      }

      // Load from database for authenticated users
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('client_email', session.user.email)
        .order('booking_date', { ascending: true });

      if (error) throw error;
      
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las reservas',
        variant: 'destructive',
      });
    }
  };

  const generateAvailableTimes = async () => {
    if (!newDate || !selectedBooking) return;

    const times: string[] = [];
    const start = 10; // 10 AM
    const end = 20; // 8 PM
    const interval = 30;

    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeSlotEnd = hour * 60 + minute + selectedBooking.total_duration;
        const endHour = Math.floor(timeSlotEnd / 60);
        
        if (endHour <= end) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          times.push(time);
        }
      }
    }

    try {
      const formattedDate = format(newDate, 'yyyy-MM-dd');
      const { data: existingBookings, error } = await supabase
        .rpc('check_booking_availability', {
          p_date: formattedDate,
          p_professional_id: selectedBooking.professional_id || 'lily'
        });

      if (error) {
        console.error('Error checking availability:', error);
        setAvailableTimes(times);
        return;
      }

      const availableFiltered = times.filter((time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const slotStartMinutes = hours * 60 + minutes;
        const slotEndMinutes = slotStartMinutes + selectedBooking.total_duration;

        const hasConflict = existingBookings?.some((booking: any) => {
          // Skip checking against the current booking
          if (booking.id === selectedBooking.id) return false;

          const [bookingHours, bookingMinutes] = booking.booking_time.split(':').map(Number);
          const bookingStartMinutes = bookingHours * 60 + bookingMinutes;
          const bookingEndMinutes = bookingStartMinutes + booking.total_duration;

          return (
            (slotStartMinutes >= bookingStartMinutes && slotStartMinutes < bookingEndMinutes) ||
            (slotEndMinutes > bookingStartMinutes && slotEndMinutes <= bookingEndMinutes) ||
            (slotStartMinutes <= bookingStartMinutes && slotEndMinutes >= bookingEndMinutes)
          );
        });

        return !hasConflict;
      });

      setAvailableTimes(availableFiltered);
    } catch (error) {
      console.error('Error generating times:', error);
      setAvailableTimes(times);
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;

    setIsLoading(true);
    try {
      const token = booking.booking_token || localStorage.getItem(`booking_token_${booking.id}`);
      
      const { data, error } = await supabase.functions.invoke('manage-booking', {
        body: {
          action: 'cancel',
          bookingId: booking.id,
          bookingToken: token,
        }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Error al cancelar la reserva');
      }

      toast({
        title: 'Reserva cancelada',
        description: 'Tu reserva ha sido cancelada exitosamente',
      });

      loadBookings();
    } catch (error: any) {
      console.error('Error canceling booking:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cancelar la reserva',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRescheduleBooking = async () => {
    if (!selectedBooking || !newDate || !selectedTime) {
      toast({
        title: 'Datos incompletos',
        description: 'Selecciona una nueva fecha y hora',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = selectedBooking.booking_token || localStorage.getItem(`booking_token_${selectedBooking.id}`);
      
      const { data, error } = await supabase.functions.invoke('manage-booking', {
        body: {
          action: 'reschedule',
          bookingId: selectedBooking.id,
          bookingToken: token,
          newDate: format(newDate, 'yyyy-MM-dd'),
          newTime: selectedTime,
        }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Error al reagendar la reserva');
      }

      toast({
        title: 'Reserva reagendada',
        description: 'Tu reserva ha sido actualizada exitosamente',
      });

      setIsRescheduleOpen(false);
      setSelectedBooking(null);
      setNewDate(undefined);
      setSelectedTime(null);
      loadBookings();
    } catch (error: any) {
      console.error('Error rescheduling booking:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo reagendar la reserva',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openReschedule = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsRescheduleOpen(true);
    setNewDate(undefined);
    setSelectedTime(null);
  };

  const RescheduleContent = () => (
    <>
      {isMobile ? (
        <DrawerHeader>
          <DrawerTitle>Reagendar Cita</DrawerTitle>
          <DrawerDescription>
            Selecciona una nueva fecha y hora para tu reserva
          </DrawerDescription>
        </DrawerHeader>
      ) : (
        <DialogHeader>
          <DialogTitle>Reagendar Cita</DialogTitle>
          <DialogDescription>
            Selecciona una nueva fecha y hora para tu reserva
          </DialogDescription>
        </DialogHeader>
      )}
      
      <div className="space-y-6 p-4">
        {selectedBooking && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="font-semibold">{selectedBooking.service_names.join(', ')}</p>
            <p className="text-sm text-muted-foreground">
              Fecha actual: {format(new Date(selectedBooking.booking_date), 'dd/MM/yyyy', { locale: es })} a las {selectedBooking.booking_time}
            </p>
          </div>
        )}

        <div>
          <h4 className="font-semibold mb-2">Selecciona nueva fecha:</h4>
          <Calendar
            mode="single"
            selected={newDate}
            onSelect={(date) => {
              if (date?.getDay() === 0) {
                toast({
                  title: 'Día no disponible',
                  description: 'Los domingos el salón está cerrado',
                  variant: 'destructive',
                });
                return;
              }
              setNewDate(date);
              setSelectedTime(null);
            }}
            disabled={(date) => date < new Date() || date.getDay() === 0}
            className="rounded-md border pointer-events-auto"
          />
        </div>

        {newDate && availableTimes.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Selecciona nueva hora:</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {availableTimes.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? 'default' : 'outline'}
                  onClick={() => setSelectedTime(time)}
                  className="text-sm"
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}

        {newDate && availableTimes.length === 0 && (
          <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm">No hay horarios disponibles para esta fecha</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleRescheduleBooking}
            disabled={!newDate || !selectedTime || isLoading}
            className="flex-1"
          >
            {isLoading ? 'Reagendando...' : 'Confirmar'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsRescheduleOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">No tienes reservas activas</p>
          </motion.div>
        ) : (
          bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`overflow-hidden ${booking.status === 'cancelled' ? 'opacity-60' : ''}`}>
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg mb-1">
                        {booking.service_names.join(', ')}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">
                        Estado: <span className="font-semibold">{booking.status}</span>
                      </p>
                    </div>
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openReschedule(booking)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancelBooking(booking)}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span>{format(new Date(booking.booking_date), 'dd/MM/yyyy', { locale: es })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{booking.booking_time} ({booking.total_duration} min)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-primary" />
                    <span>{booking.professional_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span>${booking.total_price}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </AnimatePresence>

      {isMobile ? (
        <Drawer open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
          <DrawerContent className="max-h-[90vh] overflow-y-auto">
            <RescheduleContent />
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <RescheduleContent />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};