import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import heroImage from "@/assets/hero-nails.jpg";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background z-0" />
      
      <div className="container mx-auto px-4 z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-white animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Belleza en Cada Detalle
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
          Studio de uñas premium donde el arte se encuentra con la elegancia
        </p>
        <Button 
          size="lg"
          onClick={() => navigate('/servicios')}
          className="gradient-primary text-white hover:shadow-glow transition-smooth text-lg px-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300"
        >
          <Calendar className="mr-2 h-5 w-5" />
          Reserva tu Cita
        </Button>
      </div>
    </section>
  );
};
