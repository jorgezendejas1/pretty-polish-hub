import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react';
import { SALON_INFO } from '@/lib/constants';

export const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Hours */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-white font-display font-bold text-xl">P</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Pitaya Nails
              </span>
            </Link>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 mt-1 flex-shrink-0" />
                <div>
                  <p>{SALON_INFO.hours.weekdays}</p>
                  <p>{SALON_INFO.hours.sunday}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4 text-foreground">
              Navegación
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/servicios"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link
                  to="/portafolio"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Portafolio
                </Link>
              </li>
              <li>
                <Link
                  to="/equipo"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Nuestro Equipo
                </Link>
              </li>
              <li>
                <Link
                  to="/sobre-nosotros"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Nosotros
                </Link>
              </li>
              <li>
                <Link
                  to="/certificaciones"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Certificaciones
                </Link>
              </li>
              <li>
                <Link
                  to="/editor"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Editor IA
                </Link>
              </li>
              <li>
                <Link
                  to="/contacto"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4 text-foreground">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>{SALON_INFO.address}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a
                  href={`tel:${SALON_INFO.phone}`}
                  className="hover:text-primary transition-smooth"
                >
                  {SALON_INFO.phone}
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a
                  href={`mailto:${SALON_INFO.email}`}
                  className="hover:text-primary transition-smooth"
                >
                  {SALON_INFO.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4 text-foreground">
              Síguenos
            </h3>
            <div className="flex space-x-4">
              <a
                href={SALON_INFO.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-smooth"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={SALON_INFO.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-smooth"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Pitaya Nails. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
