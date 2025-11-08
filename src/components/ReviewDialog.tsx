import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  clientEmail: string;
  clientName: string;
}

export const ReviewDialog = ({ isOpen, onClose, bookingId, clientEmail, clientName }: ReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Calificación requerida',
        description: 'Por favor selecciona una calificación',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        booking_id: bookingId,
        client_email: clientEmail,
        client_name: clientName,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast({
        title: '¡Gracias por tu reseña!',
        description: 'Tu opinión nos ayuda a mejorar nuestro servicio',
      });
      
      onClose();
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar la reseña. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Califica tu experiencia</DialogTitle>
          <DialogDescription>
            Tu opinión nos ayuda a mejorar nuestro servicio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-primary text-primary'
                      : 'text-muted'
                  }`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Cuéntanos más sobre tu experiencia (opcional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comparte tu experiencia con nosotros..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500 caracteres
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 gradient-primary text-white"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
