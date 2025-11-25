import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  type: 'new_booking' | 'cancelled_booking' | 'updated_booking';
  title: string;
  message: string;
  bookingId: string;
  timestamp: string;
  read: boolean;
}

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Suscripción en tiempo real a cambios en bookings
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          const booking = payload.new as any;
          addNotification({
            id: `notif-${Date.now()}`,
            type: 'new_booking',
            title: '🎉 Nueva Reserva',
            message: `${booking.client_name} reservó ${booking.service_names?.join(', ')} para el ${format(new Date(booking.booking_date), 'dd MMM', { locale: es })} a las ${booking.booking_time}`,
            bookingId: booking.id,
            timestamp: new Date().toISOString(),
            read: false,
          });

          // Toast notification
          toast({
            title: '🎉 Nueva Reserva',
            description: `${booking.client_name} acaba de hacer una reserva`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          const oldBooking = payload.old as any;
          const newBooking = payload.new as any;

          if (oldBooking.status !== 'cancelled' && newBooking.status === 'cancelled') {
            addNotification({
              id: `notif-${Date.now()}`,
              type: 'cancelled_booking',
              title: '❌ Reserva Cancelada',
              message: `${newBooking.client_name} canceló su reserva del ${format(new Date(newBooking.booking_date), 'dd MMM', { locale: es })} a las ${newBooking.booking_time}`,
              bookingId: newBooking.id,
              timestamp: new Date().toISOString(),
              read: false,
            });

            toast({
              title: '❌ Reserva Cancelada',
              description: `${newBooking.client_name} canceló su reserva`,
              variant: 'destructive',
            });
          } else if (
            oldBooking.booking_date !== newBooking.booking_date ||
            oldBooking.booking_time !== newBooking.booking_time
          ) {
            addNotification({
              id: `notif-${Date.now()}`,
              type: 'updated_booking',
              title: '📝 Reserva Reagendada',
              message: `${newBooking.client_name} cambió su cita al ${format(new Date(newBooking.booking_date), 'dd MMM', { locale: es })} a las ${newBooking.booking_time}`,
              bookingId: newBooking.id,
              timestamp: new Date().toISOString(),
              read: false,
            });

            toast({
              title: '📝 Reserva Reagendada',
              description: `${newBooking.client_name} reagendó su cita`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Mantener solo últimas 50
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_booking':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'cancelled_booking':
        return <X className="h-4 w-4 text-red-500" />;
      case 'updated_booking':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-12 z-50"
          >
            <Card className="w-96 max-h-[600px] shadow-xl">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificaciones
                    {unreadCount > 0 && (
                      <Badge variant="secondary">{unreadCount} nuevas</Badge>
                    )}
                  </CardTitle>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                    >
                      Marcar todas leídas
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay notificaciones</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                            !notification.read ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-sm">
                                  {notification.title}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {format(new Date(notification.timestamp), 'PPp', {
                                  locale: es,
                                })}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
