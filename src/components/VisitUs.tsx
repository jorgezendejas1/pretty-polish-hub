import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { SALON_INFO } from '@/lib/constants';
import { InteractiveMap } from './InteractiveMap';

export const VisitUs = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Visítanos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encuentra nuestro salón en el corazón de Cancún
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg shadow-soft p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg mb-2">
                    Dirección
                  </h3>
                  <p className="text-muted-foreground">{SALON_INFO.address}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-soft p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg mb-2">
                    Teléfono
                  </h3>
                  <a
                    href={`tel:${SALON_INFO.phone}`}
                    className="text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {SALON_INFO.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-soft p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg mb-2">
                    Email
                  </h3>
                  <a
                    href={`mailto:${SALON_INFO.email}`}
                    className="text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {SALON_INFO.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-soft p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg mb-2">
                    Horario
                  </h3>
                  <div className="text-muted-foreground space-y-1">
                    <p>Lun - Vie: {SALON_INFO.hours.weekdays}</p>
                    <p>Sábado: {SALON_INFO.hours.saturday}</p>
                    <p>Domingo: {SALON_INFO.hours.sunday}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="h-[500px] rounded-lg overflow-hidden shadow-elegant">
            <InteractiveMap
              lat={SALON_INFO.coordinates.lat}
              lng={SALON_INFO.coordinates.lng}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
