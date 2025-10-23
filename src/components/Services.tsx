import { useNavigate } from 'react-router-dom';
import { SERVICES } from '@/lib/constants';
import { ServiceCard } from './ServiceCard';

export const Services = () => {
  const navigate = useNavigate();
  const featuredServices = SERVICES.slice(0, 3);

  return (
    <section className="py-20 bg-gradient-soft">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in duration-1000">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre nuestra amplia gama de servicios premium para el cuidado y embellecimiento de tus uñas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={() => navigate(`/servicios?service=${service.id}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
