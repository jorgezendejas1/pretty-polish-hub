import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { SERVICES } from '@/lib/constants';
import { ServiceCard } from './ServiceCard';

export const Services = () => {
  const navigate = useNavigate();
  const featuredServices = SERVICES.slice(0, 3);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

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

  return (
    <section className="py-20 bg-gradient-soft">
      <div className="container mx-auto px-4">
        <motion.div 
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre nuestra amplia gama de servicios premium para el cuidado y embellecimiento de tus uñas
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          transition={{ staggerChildren: 0.15 }}
        >
          {featuredServices.map((service) => (
            <motion.div 
              key={service.id} 
              variants={itemVariants}
              transition={{ duration: 0.6 }}
            >
              <ServiceCard
                service={service}
                onBook={() => navigate(`/servicios?service=${service.id}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
