import { useState } from 'react';
import { PORTFOLIO_IMAGES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const Portfolio = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'masonry' | 'gallery'>('masonry');
  const [lightboxImage, setLightboxImage] = useState<number | null>(null);

  const categories = ['all', 'nail-art', 'manicura', 'esculturales', 'pedicura'];

  const filteredImages =
    categoryFilter === 'all'
      ? PORTFOLIO_IMAGES
      : PORTFOLIO_IMAGES.filter((img) => img.category === categoryFilter);

  const openLightbox = (index: number) => {
    setLightboxImage(index);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const nextImage = () => {
    if (lightboxImage !== null) {
      setLightboxImage((lightboxImage + 1) % filteredImages.length);
    }
  };

  const prevImage = () => {
    if (lightboxImage !== null) {
      setLightboxImage(
        (lightboxImage - 1 + filteredImages.length) % filteredImages.length
      );
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            Nuestro Portafolio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explora nuestra colección de diseños únicos y personalizados
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={categoryFilter === category ? 'default' : 'outline'}
              onClick={() => setCategoryFilter(category)}
              className="capitalize"
            >
              {category === 'all' ? 'Todos' : category.replace('-', ' ')}
            </Button>
          ))}
        </div>

        <div className="flex justify-center gap-2 mb-8">
          <Button
            variant={viewMode === 'masonry' ? 'default' : 'outline'}
            onClick={() => setViewMode('masonry')}
          >
            Mampostería
          </Button>
          <Button
            variant={viewMode === 'gallery' ? 'default' : 'outline'}
            onClick={() => setViewMode('gallery')}
          >
            Cuadrícula
          </Button>
        </div>

        {/* Gallery */}
        <div
          className={
            viewMode === 'gallery'
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4'
          }
        >
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-lg shadow-soft hover:shadow-elegant transition-smooth cursor-pointer break-inside-avoid"
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-primary transition-smooth"
          >
            <X className="h-8 w-8" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 text-white hover:text-primary transition-smooth"
          >
            <ChevronLeft className="h-12 w-12" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 text-white hover:text-primary transition-smooth"
          >
            <ChevronRight className="h-12 w-12" />
          </button>

          <div className="max-w-4xl max-h-[90vh] p-4">
            <img
              src={filteredImages[lightboxImage].src}
              alt={filteredImages[lightboxImage].alt}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <p className="text-white text-center mt-4">
              {filteredImages[lightboxImage].alt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
