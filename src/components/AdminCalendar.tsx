import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { TEAM_MEMBERS } from '@/lib/constants';

interface Booking {
  id: string;
  client_name: string;
  professional_id: string;
  professional_name: string;
  booking_date: string;
  booking_time: string;
  total_duration: number;
  service_names: string[];
  status: string;
}

interface DraggableBookingProps {
  booking: Booking;
}

function DraggableBooking({ booking }: DraggableBookingProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: booking.id 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/10 border-green-500 text-green-700';
      case 'pending': return 'bg-yellow-500/10 border-yellow-500 text-yellow-700';
      case 'completed': return 'bg-blue-500/10 border-blue-500 text-blue-700';
      case 'cancelled': return 'bg-red-500/10 border-red-500 text-red-700';
      default: return 'bg-muted border-border text-foreground';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 mb-2 border-l-4 rounded-lg cursor-move hover:shadow-md transition-shadow ${getStatusColor(booking.status)}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm truncate">{booking.client_name}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{booking.booking_time}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{booking.service_names.join(', ')}</p>
          <p className="text-xs text-muted-foreground">{booking.total_duration} min</p>
        </div>
      </div>
    </div>
  );
}

export function AdminCalendar() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    loadBookings();
    
    // Suscripción en tiempo real a cambios en bookings
    const channel = supabase
      .channel('admin-calendar-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWeekStart]);

  const loadBookings = async () => {
    try {
      const weekEnd = addDays(currentWeekStart, 6);
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .gte('booking_date', format(currentWeekStart, 'yyyy-MM-dd'))
        .lte('booking_date', format(weekEnd, 'yyyy-MM-dd'))
        .neq('status', 'cancelled')
        .order('booking_time');

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las reservas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const draggedBooking = bookings.find(b => b.id === active.id);
    if (!draggedBooking) return;

    // Parse drop zone: "day-{date}-professional-{id}"
    const dropZoneId = over.id.toString();
    const [, dateStr, , professionalId] = dropZoneId.split('-');

    if (!dateStr || !professionalId) return;

    const newProfessional = TEAM_MEMBERS.find(m => m.id === professionalId);
    if (!newProfessional) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_date: dateStr,
          professional_id: professionalId,
          professional_name: newProfessional.name,
        })
        .eq('id', draggedBooking.id);

      if (error) throw error;

      toast({
        title: 'Cita movida',
        description: `La cita de ${draggedBooking.client_name} fue movida a ${format(new Date(dateStr), 'dd MMM', { locale: es })} con ${newProfessional.name}`,
      });

      loadBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: 'Error',
        description: 'No se pudo mover la cita',
        variant: 'destructive',
      });
    }
  };

  const getBookingsForDayAndProfessional = (date: Date, professionalId: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter(
      b => b.booking_date === dateStr && b.professional_id === professionalId
    );
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendario de Citas por Profesional
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Semana del {format(currentWeekStart, 'dd MMM', { locale: es })} - {format(addDays(currentWeekStart, 6), 'dd MMM yyyy', { locale: es })}
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="overflow-x-auto">
              <div className="min-w-[1200px]">
                {/* Header con días de la semana */}
                <div className="grid grid-cols-8 gap-2 mb-4 sticky top-0 bg-background z-10 pb-2">
                  <div className="font-semibold text-sm text-muted-foreground">Profesional</div>
                  {weekDays.map((day, idx) => (
                    <div key={idx} className="text-center">
                      <div className="font-semibold text-sm">
                        {format(day, 'EEE', { locale: es })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(day, 'dd MMM', { locale: es })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grid de profesionales y días */}
                {TEAM_MEMBERS.map(professional => (
                  <div key={professional.id} className="grid grid-cols-8 gap-2 mb-4">
                    <div className="font-medium text-sm flex items-center">
                      <div>
                        <div>{professional.name}</div>
                        <div className="text-xs text-muted-foreground">{professional.role}</div>
                      </div>
                    </div>
                    {weekDays.map((day, dayIdx) => {
                      const isUnavailable = professional.unavailableDays.includes(day.getDay());
                      const dayBookings = getBookingsForDayAndProfessional(day, professional.id);
                      const dropZoneId = `day-${format(day, 'yyyy-MM-dd')}-professional-${professional.id}`;

                      return (
                        <div
                          key={dayIdx}
                          id={dropZoneId}
                          className={`min-h-[120px] p-2 rounded-lg border-2 border-dashed transition-colors ${
                            isUnavailable
                              ? 'bg-muted/50 border-muted cursor-not-allowed'
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          {isUnavailable ? (
                            <p className="text-xs text-muted-foreground text-center pt-8">
                              No disponible
                            </p>
                          ) : dayBookings.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center pt-8">
                              Sin citas
                            </p>
                          ) : (
                            dayBookings.map(booking => (
                              <DraggableBooking key={booking.id} booking={booking} />
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
