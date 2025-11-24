import { Card, CardContent } from '@/components/ui/card';
import { Gift, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const LoyaltyBanner = () => {
  const navigate = useNavigate();

  return (
    <Card className="shadow-elegant relative overflow-hidden border-2 border-primary/20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-glow/10"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      
      <CardContent className="relative p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow">
              <Gift className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <h3 className="text-2xl font-display font-bold">
                Programa de Lealtad
              </h3>
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>
            
            <p className="text-lg font-semibold text-foreground">
              ¡Visítanos 8 veces y la última es completamente GRATIS!
            </p>
            
            <p className="text-muted-foreground">
              Cada servicio completado cuenta para tu siguiente recompensa. 
              Regístrate para empezar a acumular visitas y disfrutar de beneficios exclusivos.
            </p>

            {/* Visual progress example */}
            <div className="flex items-center gap-1 justify-center md:justify-start mt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < 7
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-primary text-white border-2 border-primary shadow-glow animate-pulse'
                  }`}
                >
                  {i < 7 ? <Star className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="gradient-primary text-white shadow-glow hover:shadow-elegant transition-all"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Unirme Ahora
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};