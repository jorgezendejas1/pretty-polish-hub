import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, Star } from "lucide-react";
import heroImage from "@/assets/hero-nails.jpg";

export const Hero = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  const floatingAnimation = {
    y: [0, -20, 0]
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7)',
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background z-0" />
      
      {/* Floating Decorative Elements */}
      <motion.div
        animate={floatingAnimation}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "loop"
        }}
        className="absolute top-20 right-10 hidden lg:block"
      >
        <Sparkles className="w-12 h-12 text-primary/30" />
      </motion.div>
      <motion.div
        animate={floatingAnimation}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "loop",
          delay: 0.5
        }}
        className="absolute bottom-32 left-10 hidden lg:block"
      >
        <Star className="w-10 h-10 text-accent/30" />
      </motion.div>
      
      {/* Content */}
      <motion.div 
        className="container mx-auto px-4 z-10 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.2, delayChildren: 0.3 }}
      >
        <motion.h1 
          variants={itemVariants}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 text-white"
        >
          <motion.span
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Belleza
          </motion.span>
          {" "}
          <motion.span
            className="inline-block gradient-primary bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            en Cada Detalle
          </motion.span>
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          transition={{ duration: 0.8 }}
          className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto"
        >
          Studio de uñas premium donde el arte se encuentra con la elegancia
        </motion.p>
        
        <motion.div
          variants={itemVariants}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px hsl(340 65% 55% / 0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg"
              onClick={() => navigate('/servicios')}
              className="gradient-primary text-white hover:shadow-glow transition-smooth text-lg px-8 py-6 group relative overflow-hidden"
            >
              <motion.span
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <Calendar className="mr-2 h-5 w-5 relative z-10" />
              <span className="relative z-10">Reserva tu Cita</span>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};
