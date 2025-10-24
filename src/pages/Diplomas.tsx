import { DIPLOMAS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';

const Diplomas = () => {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            Certificaciones y Diplomas
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nuestro compromiso con la excelencia está respaldado por certificaciones de instituciones reconocidas internacionalmente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {DIPLOMAS.map((diploma) => (
            <Card key={diploma.id} className="overflow-hidden hover:shadow-elegant transition-smooth">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={diploma.imageUrl}
                  alt={diploma.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="font-semibold text-xl mb-2">{diploma.title}</h3>
                <p className="text-muted-foreground text-sm mb-1">{diploma.issuer}</p>
                <p className="text-primary font-semibold">{diploma.year}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-primary/10 rounded-lg p-8 max-w-2xl">
            <h2 className="text-2xl font-display font-bold mb-4">
              Educación Continua
            </h2>
            <p className="text-muted-foreground">
              Nuestro equipo se mantiene actualizado con las últimas tendencias y técnicas mediante capacitación continua y asistencia a convenciones internacionales de la industria de belleza.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diplomas;
