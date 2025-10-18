import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";

const galleryImages = [
  { src: gallery1, alt: "French manicure with gold accents" },
  { src: gallery2, alt: "Lavender ombre nail design" },
  { src: gallery3, alt: "Nude stiletto nails with gold foil" },
  { src: gallery4, alt: "Pastel rainbow nail art" }
];

export const Gallery = () => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryImages.map((image, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-xl shadow-soft hover:shadow-elegant transition-smooth animate-in fade-in zoom-in-95 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img 
                src={image.src} 
                alt={image.alt}
                className="w-full h-80 object-cover group-hover:scale-110 transition-smooth"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-smooth flex items-end justify-center pb-6">
                <p className="text-white font-display text-lg">Ver Diseño</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
