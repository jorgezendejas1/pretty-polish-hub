import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Heart, Star, Gem } from "lucide-react";

const services = [
  {
    icon: Sparkles,
    title: "Manicura Clásica",
    description: "Cuidado profesional de tus manos con técnicas tradicionales y productos premium",
    price: "Desde $25"
  },
  {
    icon: Heart,
    title: "Pedicura Spa",
    description: "Experiencia relajante con exfoliación, masaje y acabado perfecto",
    price: "Desde $35"
  },
  {
    icon: Star,
    title: "Uñas Acrílicas",
    description: "Extensiones y diseños personalizados que duran semanas",
    price: "Desde $50"
  },
  {
    icon: Gem,
    title: "Nail Art Premium",
    description: "Diseños exclusivos y creativos adaptados a tu estilo único",
    price: "Desde $40"
  }
];

export const Services = () => {
  return (
    <section className="py-20 gradient-soft" id="servicios">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
            Nuestros Servicios
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experiencias únicas diseñadas para resaltar tu belleza natural
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card 
              key={service.title}
              className="shadow-elegant hover:shadow-glow transition-smooth hover:-translate-y-2 border-border/50 bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center mb-4 mx-auto shadow-soft">
                  <service.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-center font-display text-xl">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="mb-4 text-sm leading-relaxed">
                  {service.description}
                </CardDescription>
                <p className="text-primary font-semibold text-lg">
                  {service.price}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
