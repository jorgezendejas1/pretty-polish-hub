import { useState, useEffect } from 'react';
import { BookingState, Service, TeamMember } from '@/types';
import { TEAM_MEMBERS } from '@/lib/constants';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Upload, Check, Calendar as CalendarIcon, Clock, DollarSign, User, Mail, Phone, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface BookingFlowProps {
  initialServices: Service[];
  onBack: () => void;
}

export const BookingFlow = ({ initialServices, onBack }: BookingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingState, setBookingState] = useState<BookingState>(() => {
    const saved = localStorage.getItem('bookingState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        selectedDate: parsed.selectedDate ? new Date(parsed.selectedDate) : null,
      };
    }
    return {
      selectedServices: initialServices,
      customizations: {},
      selectedProfessional: TEAM_MEMBERS[0], // Lily por defecto
      selectedDate: null,
      selectedTime: null,
      clientData: { name: '', email: '', phone: '' },
      currentStep: 0,
    };
  });

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEligibleForFreeVisit, setIsEligibleForFreeVisit] = useState(false);

  useEffect(() => {
    localStorage.setItem('bookingState', JSON.stringify(bookingState));
  }, [bookingState]);

  // Verificar elegibilidad para visita gratis
  useEffect(() => {
    checkLoyaltyEligibility();
  }, []);

  const checkLoyaltyEligibility = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('loyalty_rewards')
        .select('visits_count')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (data && data.visits_count >= 7) {
        setIsEligibleForFreeVisit(true);
      }
    } catch (error) {
      console.error('Error checking loyalty:', error);
    }
  };

  // Auto-fill user data if authenticated
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email || '';
        const fullName = session.user.user_metadata?.full_name || '';
        const phone = session.user.user_metadata?.phone || '';
        
        setBookingState(prev => ({
          ...prev,
          clientData: {
            ...prev.clientData,
            email: email || prev.clientData.email,
            name: fullName || prev.clientData.name,
            phone: phone || prev.clientData.phone,
          }
        }));
      }
    });
  }, []);

  // Regenerar horarios disponibles cuando cambie el profesional, la fecha o los servicios
  useEffect(() => {
    if (bookingState.selectedDate && bookingState.selectedProfessional) {
      generateAvailableTimes();
    }
  }, [bookingState.selectedProfessional, bookingState.selectedDate, bookingState.selectedServices, bookingState.customizations]);

  const totalDuration = bookingState.selectedServices.reduce((sum, service) => {
    const customization = bookingState.customizations[service.id];
    if (service.isCustomizable && customization?.quantity) {
      return sum + (service.durationPerUnit || 0) * customization.quantity;
    }
    return sum + service.duration;
  }, 0);

  const totalPrice = isEligibleForFreeVisit ? 0 : bookingState.selectedServices.reduce((sum, service) => {
    const customization = bookingState.customizations[service.id];
    if (service.isCustomizable && customization?.quantity) {
      return sum + (service.pricePerUnit || 0) * customization.quantity;
    }
    return sum + service.price;
  }, 0);

  const generateAvailableTimes = async () => {
    if (!bookingState.selectedDate || !bookingState.selectedProfessional) {
      setAvailableTimes([]);
      return;
    }

    const times: string[] = [];
    const start = 10; // 10 AM
    const end = 20; // 8 PM
    const interval = 30; // 30 minutos

    // Generar todos los horarios posibles
    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeSlotEnd = hour * 60 + minute + totalDuration;
        const endHour = Math.floor(timeSlotEnd / 60);
        
        if (endHour <= end) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          times.push(time);
        }
      }
    }

    // Consultar reservas existentes para esa fecha y profesional
    try {
      const formattedDate = format(bookingState.selectedDate, 'yyyy-MM-dd');
      const { data: existingBookings, error } = await supabase
        .rpc('check_booking_availability', {
          p_date: formattedDate,
          p_professional_id: bookingState.selectedProfessional.id
        });

      if (error) {
        console.error('Error al consultar disponibilidad:', error);
        setAvailableTimes(times);
        return;
      }

      // Filtrar horarios ocupados
      const availableFiltered = times.filter((time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const slotStartMinutes = hours * 60 + minutes;
        const slotEndMinutes = slotStartMinutes + totalDuration;

        // Verificar si este horario se solapa con alguna reserva existente
        const hasConflict = existingBookings?.some((booking) => {
          const [bookingHours, bookingMinutes] = booking.booking_time.split(':').map(Number);
          const bookingStartMinutes = bookingHours * 60 + bookingMinutes;
          const bookingEndMinutes = bookingStartMinutes + booking.total_duration;

          // Hay conflicto si los horarios se solapan
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
      console.error('Error al verificar disponibilidad:', error);
      setAvailableTimes(times);
    }
  };

  const handleDateSelect = async (date: Date | undefined) => {
    if (date) {
      // Bloquear domingos (day 0)
      if (date.getDay() === 0) {
        toast({
          title: 'Día no disponible',
          description: 'Los domingos el salón está cerrado',
          variant: 'destructive',
        });
        return;
      }
      setBookingState({ ...bookingState, selectedDate: date, selectedTime: null });
      await generateAvailableTimes();
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      // Validar personalización
      for (const service of bookingState.selectedServices) {
        if (service.isCustomizable) {
          const customization = bookingState.customizations[service.id];
          if (!customization || customization.quantity === 0) {
            toast({
              title: 'Personalización requerida',
              description: `Por favor personaliza el servicio: ${service.name}`,
              variant: 'destructive',
            });
            return;
          }
        }
      }
    }

    if (currentStep === 2) {
      if (!bookingState.selectedDate || !bookingState.selectedTime) {
        toast({
          title: 'Selección incompleta',
          description: 'Por favor selecciona fecha y hora',
          variant: 'destructive',
        });
        return;
      }
    }

    if (currentStep === 3) {
      if (
        !bookingState.clientData.name ||
        !bookingState.clientData.email ||
        !bookingState.clientData.phone
      ) {
        toast({
          title: 'Datos incompletos',
          description: 'Por favor completa todos los campos requeridos',
          variant: 'destructive',
        });
        return;
      }
    }

    setCurrentStep((prev) => {
      const nextStep = prev + 1;
      // Scroll to top cuando avanzamos al siguiente paso
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return nextStep;
    });
  };

  const handleBack = () => {
    if (currentStep === 0) {
      onBack();
    } else {
      setCurrentStep((prev) => prev - 1);
      // Scroll to top cuando regresamos al paso anterior
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Collect all inspiration images from customizations
      const inspirationImages: string[] = [];
      Object.values(bookingState.customizations).forEach((customization: any) => {
        if (customization?.images && Array.isArray(customization.images)) {
          inspirationImages.push(...customization.images);
        }
      });

      const bookingData = {
        client_name: bookingState.clientData.name,
        client_email: bookingState.clientData.email,
        client_phone: bookingState.clientData.phone,
        service_ids: bookingState.selectedServices.map(s => s.id),
        service_names: bookingState.selectedServices.map(s => s.name),
        professional_id: bookingState.selectedProfessional?.id || '',
        professional_name: bookingState.selectedProfessional?.name || '',
        booking_date: format(bookingState.selectedDate!, 'yyyy-MM-dd'),
        booking_time: bookingState.selectedTime!,
        total_price: totalPrice,
        total_duration: totalDuration,
        customizations: bookingState.customizations as any,
        inspiration_images: inspirationImages,
      };

      // Use the secure endpoint with validation
      const response = await supabase.functions.invoke('create-booking', {
        body: bookingData
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error al crear la reserva');
      }

      if (!response.data?.success) {
        const errorDetails = response.data?.details ? ` (${response.data.details.join(', ')})` : '';
        throw new Error(response.data?.error + errorDetails || 'Error al crear la reserva');
      }

      const booking = response.data.booking;
      const bookingToken = response.data.booking_token;

      // Store booking info for payment
      localStorage.setItem(`booking_token_${booking.id}`, bookingToken);
      localStorage.setItem('pending_payment_booking', JSON.stringify({
        id: booking.id,
        amount: totalPrice,
        customerEmail: bookingState.clientData.email,
        customerName: bookingState.clientData.name,
      }));

      // Guardar en historial local con token
      const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
      history.push({
        id: booking.id,
        date: format(bookingState.selectedDate!, 'dd/MM/yyyy', { locale: es }),
        services: bookingState.selectedServices,
        professionalName: bookingState.selectedProfessional?.name || '',
        totalPrice,
        totalDuration,
        booking_token: bookingToken,
      });
      localStorage.setItem('bookingHistory', JSON.stringify(history));

      // Si el precio es 0 (visita gratis), confirmar directamente
      if (totalPrice === 0) {
        setCurrentStep(6);
        localStorage.removeItem('bookingState');
        triggerConfetti();
        toast({
          title: '¡Reserva confirmada!',
          description: '¡Felicidades! Esta visita es gratis por tu lealtad.',
        });
      } else {
        // Avanzar al paso de pago
        setCurrentStep(6);
        toast({
          title: 'Reserva creada',
          description: 'Procede con el pago para confirmar tu reserva',
        });
      }
    } catch (error: any) {
      console.error('Error al crear reserva:', error);
      toast({
        title: 'Error',
        description: error.message || 'Hubo un problema al procesar tu reserva. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadICS = () => {
    if (!bookingState.selectedDate || !bookingState.selectedTime) return;

    const [hours, minutes] = bookingState.selectedTime.split(':').map(Number);
    const startDate = setMinutes(setHours(bookingState.selectedDate, hours), minutes);
    const endDate = addDays(startDate, 0);
    endDate.setMinutes(endDate.getMinutes() + totalDuration);

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:Cita en Pitaya Nails
DESCRIPTION:${bookingState.selectedServices.map(s => s.name).join(', ')}
LOCATION:Jardines del Sur 5, Cancún, Quintana Roo
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cita-pitaya-nails.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePayment = async () => {
    try {
      const pendingBooking = JSON.parse(localStorage.getItem('pending_payment_booking') || '{}');
      
      if (!pendingBooking.id) {
        throw new Error('No se encontró información de la reserva');
      }

      setIsSubmitting(true);

      const response = await supabase.functions.invoke('create-checkout-session', {
        body: {
          bookingId: pendingBooking.id,
          amount: pendingBooking.amount,
          customerEmail: pendingBooking.customerEmail,
          customerName: pendingBooking.customerName,
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
      } else {
        throw new Error('No se recibió URL de pago');
      }
    } catch (error: any) {
      console.error('Error al procesar pago:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo procesar el pago',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    'Personalización',
    'Profesional',
    'Fecha y Hora',
    'Tus Datos',
    'Revisar',
    'Confirmar',
    'Pago',
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto px-4 py-8"
      >
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-display font-bold">Reserva tu Cita</h2>
          <Button variant="ghost" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Atrás
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Paso {currentStep + 1} de {steps.length}: {steps[currentStep]}
        </p>
      </div>

      {/* Paso 0: Personalización */}
      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Personaliza tus servicios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Editor Mágico Link */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">✨ ¿Necesitas inspiración?</h3>
                  <p className="text-sm text-muted-foreground">Usa nuestro Editor Mágico para crear diseños únicos</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.open('/editor', '_blank')}
                  className="ml-4"
                >
                  Abrir Editor
                </Button>
              </div>
            </div>
            {bookingState.selectedServices.map((service) => (
              <div key={service.id} className="border-b pb-6 last:border-b-0">
                <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                <div className="space-y-4">
                  {service.isCustomizable && (
                    <div>
                      <Label>{service.customizationPrompt}</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={bookingState.customizations[service.id]?.quantity || ''}
                        onChange={(e) => {
                          const quantity = parseInt(e.target.value) || 0;
                          setBookingState({
                            ...bookingState,
                            customizations: {
                              ...bookingState.customizations,
                              [service.id]: {
                                ...bookingState.customizations[service.id],
                                quantity,
                              },
                            },
                          });
                        }}
                        className="mt-2"
                      />
                    </div>
                  )}
                  <div>
                    <Label>Notas adicionales (opcional)</Label>
                    <Textarea
                      value={bookingState.customizations[service.id]?.notes || ''}
                      onChange={(e) => {
                        setBookingState({
                          ...bookingState,
                          customizations: {
                            ...bookingState.customizations,
                            [service.id]: {
                              ...bookingState.customizations[service.id],
                              notes: e.target.value,
                            },
                          },
                        });
                      }}
                      className="mt-2"
                      placeholder="Describe el diseño que deseas..."
                    />
                  </div>
                  <div>
                    <Label>Imágenes de inspiración (opcional)</Label>
                    <div className="mt-2 space-y-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length === 0) return;
                          
                          const currentImages = bookingState.customizations[service.id]?.images || [];
                          if (currentImages.length + files.length > 3) {
                            toast({
                              title: 'Límite excedido',
                              description: 'Puedes subir máximo 3 imágenes',
                              variant: 'destructive',
                            });
                            return;
                          }

                          try {
                            const uploadedUrls: string[] = [];
                            
                            for (const file of files) {
                              if (file.size > 5 * 1024 * 1024) {
                                toast({
                                  title: 'Archivo muy grande',
                                  description: 'Las imágenes deben ser menores a 5MB',
                                  variant: 'destructive',
                                });
                                continue;
                              }
                              
                              const fileExt = file.name.split('.').pop();
                              const fileName = `${Math.random()}.${fileExt}`;
                              const filePath = `${fileName}`;

                              const { error: uploadError } = await supabase.storage
                                .from('client-inspirations')
                                .upload(filePath, file);

                              if (uploadError) {
                                console.error('Upload error:', uploadError);
                                toast({
                                  title: 'Error al subir',
                                  description: 'No se pudo subir la imagen',
                                  variant: 'destructive',
                                });
                                continue;
                              }

                              // Generate signed URL from private bucket (valid for 1 year)
                              const { data: signedUrlData, error: urlError } = await supabase.storage
                                .from('client-inspirations')
                                .createSignedUrl(filePath, 31536000); // 1 year validity

                              if (urlError || !signedUrlData) {
                                console.error('Error generating signed URL:', urlError);
                                toast({
                                  title: 'Error',
                                  description: 'No se pudo procesar la imagen',
                                  variant: 'destructive',
                                });
                                continue;
                              }

                              uploadedUrls.push(signedUrlData.signedUrl);
                            }

                            setBookingState({
                              ...bookingState,
                              customizations: {
                                ...bookingState.customizations,
                                [service.id]: {
                                  ...bookingState.customizations[service.id],
                                  images: [...currentImages, ...uploadedUrls],
                                },
                              },
                            });

                            toast({
                              title: 'Imágenes subidas',
                              description: `${uploadedUrls.length} imagen(es) subida(s) exitosamente`,
                            });
                          } catch (error) {
                            console.error('Error:', error);
                            toast({
                              title: 'Error',
                              description: 'Ocurrió un error al subir las imágenes',
                              variant: 'destructive',
                            });
                          }
                        }}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Sube hasta 3 imágenes (máx. 5MB c/u) del diseño que deseas
                      </p>
                      {bookingState.customizations[service.id]?.images && bookingState.customizations[service.id].images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          {bookingState.customizations[service.id].images.map((url: string, idx: number) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                              <img src={url} alt={`Inspiración ${idx + 1}`} className="w-full h-full object-cover" />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => {
                                  const newImages = bookingState.customizations[service.id].images.filter((_: string, i: number) => i !== idx);
                                  setBookingState({
                                    ...bookingState,
                                    customizations: {
                                      ...bookingState.customizations,
                                      [service.id]: {
                                        ...bookingState.customizations[service.id],
                                        images: newImages,
                                      },
                                    },
                                  });
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button onClick={handleNext} className="w-full gradient-primary text-white">
              Continuar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Paso 1: Profesional */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Selecciona tu profesional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {TEAM_MEMBERS.map((member) => (
                <Card
                  key={member.id}
                  className={`cursor-pointer transition-all ${
                    bookingState.selectedProfessional?.id === member.id
                      ? 'ring-2 ring-primary'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() =>
                    setBookingState({ ...bookingState, selectedProfessional: member, selectedTime: null })
                  }
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-primary">{member.role}</p>
                      <p className="text-xs text-muted-foreground">{member.specialty}</p>
                    </div>
                    {bookingState.selectedProfessional?.id === member.id && (
                      <Check className="h-6 w-6 text-primary" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button
              onClick={handleNext}
              disabled={!bookingState.selectedProfessional}
              className="w-full gradient-primary text-white"
            >
              Continuar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Paso 2: Fecha y Hora */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Selecciona fecha y hora</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Calendar
                mode="single"
                selected={bookingState.selectedDate || undefined}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  const day = date.getDay();
                  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                  const isSunday = day === 0; // Bloquear domingos (cerrado)
                  const isUnavailable = bookingState.selectedProfessional?.unavailableDays.includes(day);
                  return isPast || isSunday || isUnavailable || false;
                }}
                locale={es}
                className="rounded-md border mx-auto"
              />
            </div>
            {bookingState.selectedDate && (
              <div>
                <Label className="mb-4 block">Horarios disponibles</Label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <Button
                      key={time}
                      variant={bookingState.selectedTime === time ? 'default' : 'outline'}
                      onClick={() => setBookingState({ ...bookingState, selectedTime: time })}
                      className="text-sm"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <Button
              onClick={handleNext}
              disabled={!bookingState.selectedDate || !bookingState.selectedTime}
              className="w-full gradient-primary text-white"
            >
              Continuar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Paso 3: Tus Datos */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Tus datos de contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={bookingState.clientData.name}
                onChange={(e) =>
                  setBookingState({
                    ...bookingState,
                    clientData: { ...bookingState.clientData, name: e.target.value },
                  })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={bookingState.clientData.email}
                onChange={(e) =>
                  setBookingState({
                    ...bookingState,
                    clientData: { ...bookingState.clientData, email: e.target.value },
                  })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={bookingState.clientData.phone}
                onChange={(e) =>
                  setBookingState({
                    ...bookingState,
                    clientData: { ...bookingState.clientData, phone: e.target.value },
                  })
                }
                className="mt-2"
                placeholder="+52 998 123 4567"
              />
            </div>
            
            <div className="space-y-3 pt-4 border-t">
              <Label className="text-base font-semibold">Recordatorios de Cita</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookingState.clientData.emailReminder !== false}
                    onChange={(e) =>
                      setBookingState({
                        ...bookingState,
                        clientData: { ...bookingState.clientData, emailReminder: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-sm">Enviarme un recordatorio por correo 24h antes</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookingState.clientData.smsReminder === true}
                    onChange={(e) =>
                      setBookingState({
                        ...bookingState,
                        clientData: { ...bookingState.clientData, smsReminder: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-sm">Enviarme un recordatorio por SMS 24h antes</span>
                </label>
              </div>
            </div>
            
            <Button onClick={handleNext} className="w-full gradient-primary text-white">
              Continuar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Paso 4: Revisar */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Revisa tu reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Servicios</h3>
                  <ul className="space-y-1">
                    {bookingState.selectedServices.map((service) => (
                      <li key={service.id} className="text-sm text-muted-foreground">
                        {service.name}
                        {service.isCustomizable &&
                          bookingState.customizations[service.id]?.quantity && (
                            <span> (x{bookingState.customizations[service.id].quantity})</span>
                          )}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(0)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Profesional</h3>
                  <p className="text-sm text-muted-foreground">
                    {bookingState.selectedProfessional?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Fecha y hora</h3>
                  <p className="text-sm text-muted-foreground">
                    {bookingState.selectedDate &&
                      format(bookingState.selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                        locale: es,
                      })}
                  </p>
                  <p className="text-sm text-muted-foreground">{bookingState.selectedTime}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Tus datos</h3>
                  <p className="text-sm text-muted-foreground">{bookingState.clientData.name}</p>
                  <p className="text-sm text-muted-foreground">{bookingState.clientData.email}</p>
                  <p className="text-sm text-muted-foreground">{bookingState.clientData.phone}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Duración total
                  </span>
                  <span className="font-semibold">{totalDuration} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Precio total
                  </span>
                  {isEligibleForFreeVisit ? (
                    <div className="text-right">
                      <span className="line-through text-muted-foreground text-sm mr-2">
                        ${bookingState.selectedServices.reduce((sum, s) => sum + s.price, 0)}
                      </span>
                      <span className="font-bold text-2xl text-primary">GRATIS</span>
                    </div>
                  ) : (
                    <span className="font-semibold text-lg">${totalPrice}</span>
                  )}
                </div>
                {isEligibleForFreeVisit && (
                  <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm text-primary font-semibold text-center">
                      🎉 ¡Felicidades! Esta visita es gratis por tu lealtad 🎉
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleNext} className="w-full gradient-primary text-white">
              Confirmar reserva
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Paso 5: Confirmar */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Confirma tu reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Al confirmar, se enviará tu solicitud de reserva. Nos pondremos en contacto contigo
              para confirmar la disponibilidad.
            </p>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full gradient-primary text-white"
            >
              {isSubmitting ? 'Procesando...' : 'Enviar solicitud'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Paso 6: Pago */}
      {currentStep === 6 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Completar Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {totalPrice === 0 ? (
              // Si es visita gratis, mostrar confirmación
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold mb-2">¡Reserva Confirmada!</h2>
                  <p className="text-muted-foreground">
                    🎉 ¡Esta visita es completamente gratis por tu lealtad!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Te hemos enviado un correo con todos los detalles.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button onClick={downloadICS} variant="outline" className="w-full">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Añadir al calendario
                  </Button>
                  <Button onClick={onBack} className="w-full gradient-primary text-white">
                    Volver al inicio
                  </Button>
                </div>
              </div>
            ) : (
              // Si hay que pagar, mostrar opciones de pago
              <>
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total a Pagar:</span>
                    <span className="text-3xl font-bold text-primary">${totalPrice} MXN</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Pago seguro con Stripe</p>
                    <p>• Acepta tarjetas de crédito y débito</p>
                    <p>• Transacción encriptada y protegida</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>📌 Importante:</strong> Tu reserva ha sido creada pero aún no está confirmada. Completa el pago para confirmar tu cita.
                    </p>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isSubmitting}
                    className="w-full gradient-primary text-white h-12 text-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Procesando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Pagar con Stripe
                      </span>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Al hacer clic serás redirigido a la página segura de Stripe para completar el pago
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3 text-sm">Resumen de tu Reserva:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fecha:</span>
                      <span className="font-medium">
                        {bookingState.selectedDate &&
                          format(bookingState.selectedDate, "dd/MM/yyyy", { locale: es })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hora:</span>
                      <span className="font-medium">{bookingState.selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profesional:</span>
                      <span className="font-medium">{bookingState.selectedProfessional?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duración:</span>
                      <span className="font-medium">{totalDuration} min</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
     </motion.div>
     </AnimatePresence>
   );
 };
