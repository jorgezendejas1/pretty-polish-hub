import { ABOUT_TEXT, SALON_INFO } from '@/lib/constants';

const About = () => {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-8 text-center">
            Sobre Nosotros
          </h1>
          
          <div className="prose prose-lg mx-auto mb-12">
            {ABOUT_TEXT.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="text-muted-foreground mb-4">
                  {paragraph.trim()}
                </p>
              )
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💅</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Calidad Premium</h3>
              <p className="text-muted-foreground">
                Utilizamos solo productos de la más alta calidad para garantizar resultados excepcionales.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Experiencia Personalizada</h3>
              <p className="text-muted-foreground">
                Cada cliente recibe atención individualizada adaptada a sus necesidades únicas.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌟</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Profesionales Certificadas</h3>
              <p className="text-muted-foreground">
                Nuestro equipo cuenta con certificaciones internacionales y años de experiencia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
