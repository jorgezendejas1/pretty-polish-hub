import { BEFORE_AFTER_IMAGES } from '@/lib/constants';
import { BeforeAfterGallery } from '@/ui-kit/BeforeAfterGallery';

const BeforeAfter = () => {

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            Antes y Después
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transforma tus uñas con nuestros tratamientos profesionales
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <BeforeAfterGallery images={BEFORE_AFTER_IMAGES} />
        </div>
      </div>
    </div>
  );
};

export default BeforeAfter;
