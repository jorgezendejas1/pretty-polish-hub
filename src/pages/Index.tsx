import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Gallery } from "@/components/Gallery";
import { VisitUs } from "@/components/VisitUs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TESTIMONIALS } from "@/lib/constants";
import { Wand2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Hero />
      <Services />
      
      {/* Editor Mágico Section */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(var(--primary-rgb),0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
                <Sparkles className="h-4 w-4" />
                Herramienta con IA
              </div>
              
              <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                Prueba Nuestro Editor Mágico
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                ¿Tienes una foto de tus uñas que te gustaría mejorar? Usa nuestra herramienta con IA para aplicar filtros, cambiar colores o añadir efectos espectaculares con solo escribir lo que quieres.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/editor')}
                  className="gradient-primary text-white font-semibold shadow-glow hover:shadow-elegant transition-smooth h-12 px-8"
                >
                  <Wand2 className="mr-2 h-5 w-5" />
                  ¡Probar Ahora!
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-3xl blur-3xl" />
              <Card className="relative shadow-elegant border-primary/20">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-muted-foreground">Antes</div>
                        <div className="aspect-square bg-gradient-to-br from-secondary to-secondary/50 rounded-lg flex items-center justify-center">
                          <span className="text-4xl">💅</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-muted-foreground">Después</div>
                        <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                          <span className="text-4xl">✨</span>
                          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-sm text-muted-foreground">Cambio de colores instantáneo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-100" />
                        <span className="text-sm text-muted-foreground">Efectos profesionales con IA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-200" />
                        <span className="text-sm text-muted-foreground">Resultados en segundos</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Gallery />
      
      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Lo Que Dicen Nuestras Clientas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              La satisfacción de nuestras clientas es nuestra mayor recompensa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="shadow-soft hover:shadow-elegant transition-smooth">
                <CardContent className="pt-6">
                  <p className="text-lg text-muted-foreground italic mb-4">
                    "{testimonial.quote}"
                  </p>
                  <p className="font-display font-semibold text-foreground">
                    - {testimonial.author}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <VisitUs />
    </div>
  );
};

export default Index;
