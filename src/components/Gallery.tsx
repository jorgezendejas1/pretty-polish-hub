import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { PORTFOLIO_IMAGES } from '@/lib/constants';
import { Button } from './ui/button';

export const Gallery = () => {
  const navigate = useNavigate();
  const previewImages = PORTFOLIO_IMAGES.slice(0, 4);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1
    }
  };

  return (
    <section className="py-20 bg-background" id="galeria">
      <div className="container mx-auto px-4">
        <motion.div 
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
            Galería de Diseños
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Algunos de nuestros trabajos más recientes
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          transition={{ staggerChildren: 0.1 }}
        >
          {previewImages.map((image, index) => (
            <motion.div
              key={image.id}
              variants={itemVariants}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className="aspect-square overflow-hidden rounded-lg shadow-soft hover:shadow-elegant transition-smooth cursor-pointer group relative"
              onClick={() => navigate('/portafolio')}
            >
              <motion.img 
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.15 }}
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
              >
                <p className="text-white text-sm font-semibold">{image.category}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => navigate('/portafolio')}
              className="gradient-primary text-white"
            >
              Ver Portafolio Completo
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
