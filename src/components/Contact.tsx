import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const Contact = () => {
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

          <Card className="shadow-soft hover:shadow-elegant transition-smooth border-border/50 bg-card animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-4 mx-auto">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display font-semibold mb-2">Teléfono</h3>
              <p className="text-sm text-muted-foreground">
                +34 123 456 789
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

        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <Button 
            size="lg"
            className="gradient-primary text-white hover:shadow-glow transition-smooth text-lg px-10 py-6"
          >
            Reserva tu Cita Ahora
          </Button>
        </div>
      </div>
    </section>
  );
};
