import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Gallery } from "@/components/Gallery";
import { VisitUs } from "@/components/VisitUs";
import { Card, CardContent } from "@/components/ui/card";
import { TESTIMONIALS } from "@/lib/constants";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Services />
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
