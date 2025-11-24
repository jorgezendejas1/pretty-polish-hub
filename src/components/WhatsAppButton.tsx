import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const WhatsAppButton = () => {
  const phoneNumber = '5219985900050'; // +52 998 590 0050
  const message = encodeURIComponent('Vengo de PitayaNails.com, quiero mas informacion');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <Button
      asChild
      className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-elegant bg-[#25D366] hover:bg-[#20BA5A] text-white z-40 transition-all hover:scale-110"
      size="icon"
      title="Contactar por WhatsApp"
    >
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-6 w-6" fill="currentColor" />
      </a>
    </Button>
  );
};
