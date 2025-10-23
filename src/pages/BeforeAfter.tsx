import { useState } from 'react';
import { BEFORE_AFTER_IMAGES } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';

const BeforeAfter = () => {
  const [sliderPositions, setSliderPositions] = useState<Record<string, number>>(
    BEFORE_AFTER_IMAGES.reduce((acc, img) => ({ ...acc, [img.id]: 50 }), {})
  );

  const handleSliderChange = (id: string, value: number) => {
    setSliderPositions({ ...sliderPositions, [id]: value });
  };

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

        <div className="grid md:grid-cols-2 gap-8">
          {BEFORE_AFTER_IMAGES.map((item) => (
            <Card key={item.id} className="overflow-hidden shadow-elegant">
              <div className="relative h-96 bg-muted">
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={item.afterSrc}
                    alt={`${item.title} - Después`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPositions[item.id]}% 0 0)` }}
                  >
                    <img
                      src={item.beforeSrc}
                      alt={`${item.title} - Antes`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Slider */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                  style={{ left: `${sliderPositions[item.id]}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                    <div className="w-4 h-4 border-l-2 border-r-2 border-primary"></div>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPositions[item.id]}
                  onChange={(e) =>
                    handleSliderChange(item.id, parseInt(e.target.value))
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                />

                {/* Labels */}
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  Antes
                </div>
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  Después
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="font-display font-semibold text-xl mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BeforeAfter;
