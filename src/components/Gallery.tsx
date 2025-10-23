import { useNavigate } from 'react-router-dom';
import { PORTFOLIO_IMAGES } from '@/lib/constants';
import { Button } from './ui/button';

export const Gallery = () => {
  const navigate = useNavigate();
  const previewImages = PORTFOLIO_IMAGES.slice(0, 4);

  return (
    <section className="py-20 bg-background" id="galeria">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
            Galería de Diseños
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Algunos de nuestros trabajos más recientes
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previewImages.map((image) => (
            <div 
              key={image.id}
              className="aspect-square overflow-hidden rounded-lg shadow-soft hover:shadow-elegant transition-smooth cursor-pointer"
              onClick={() => navigate('/portafolio')}
            >
              <img 
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            onClick={() => navigate('/portafolio')}
            className="gradient-primary text-white"
          >
            Ver Portafolio Completo
          </Button>
        </div>
      </div>
    </section>
  );
};
