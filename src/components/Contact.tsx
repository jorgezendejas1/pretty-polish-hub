import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Send WhatsApp message
    const whatsappNumber = "529981234567";
    const whatsappMessage = `Hola, soy ${formData.name}. ${formData.message}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    window.open(whatsappUrl, '_blank');

    toast({
      title: "¡Mensaje enviado!",
      description: "Te contactaremos pronto por WhatsApp"
    });

    setFormData({ name: '', email: '', phone: '', message: '' });
    setIsSubmitting(false);
  };

  const handleWhatsAppClick = () => {
    const whatsappNumber = "529981234567";
    const message = "Mas Info";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="py-20 bg-background" id="contacto">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
            Visítanos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Estamos aquí para hacer tus uñas lucir increíbles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="shadow-soft hover:shadow-elegant transition-smooth border-border/50 bg-card animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-4 mx-auto">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display font-semibold mb-2">Ubicación</h3>
              <p className="text-sm text-muted-foreground">
                Av. Principal 123<br />
                Centro, Ciudad
              </p>
            </CardContent>
          </Card>

          <Card 
            className="shadow-soft hover:shadow-elegant transition-smooth border-border/50 bg-card animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 cursor-pointer"
            onClick={handleWhatsAppClick}
          >
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-4 mx-auto">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display font-semibold mb-2">WhatsApp</h3>
              <p className="text-sm text-muted-foreground">
                Envía "Mas Info"
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-elegant transition-smooth border-border/50 bg-card animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-4 mx-auto">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display font-semibold mb-2">Email</h3>
              <p className="text-sm text-muted-foreground">
                info@pitayanails.com
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-elegant transition-smooth border-border/50 bg-card animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-4 mx-auto">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display font-semibold mb-2">Horario</h3>
              <p className="text-sm text-muted-foreground">
                Lun - Sáb<br />
                10:00 - 20:00
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto shadow-elegant animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-2xl font-display font-bold mb-6 text-center">Envíanos un Mensaje</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+52 998 123 4567"
                />
              </div>
              <div>
                <Label htmlFor="message">Mensaje *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Cuéntanos cómo podemos ayudarte..."
                  rows={5}
                  required
                />
              </div>
              <Button 
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full gradient-primary text-white hover:shadow-glow transition-smooth"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <Button 
            size="lg"
            onClick={() => navigate('/servicios')}
            className="gradient-primary text-white hover:shadow-glow transition-smooth text-lg px-10 py-6"
          >
            Reserva tu Cita Ahora
          </Button>
        </div>
      </div>
    </section>
  );
};
