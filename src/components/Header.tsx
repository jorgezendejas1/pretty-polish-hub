import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X, Calendar, Instagram, Facebook, Phone } from 'lucide-react';
import { SALON_INFO } from '@/lib/constants';
import { AuthButton } from '@/components/AuthButton';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Servicios', path: '/servicios' },
    { name: 'Portafolio', path: '/portafolio' },
    { name: 'Antes/Después', path: '/transformaciones' },
    { name: 'Equipo', path: '/equipo' },
    { name: 'Nosotros', path: '/sobre-nosotros' },
    { name: 'Certificaciones', path: '/certificaciones' },
    { name: 'Editor IA', path: '/editor' },
    { name: 'Contacto', path: '/contacto' },
  ];

  const handleBooking = () => {
    navigate('/servicios');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-lg shadow-elegant'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-white font-display font-bold text-xl">P</span>
              </div>
              <span className="font-display font-bold text-2xl text-foreground">
                Pitaya Nails
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.slice(0, 6).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm font-medium text-foreground hover:text-primary transition-smooth relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <a
                href={SALON_INFO.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-smooth"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={SALON_INFO.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-smooth"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={SALON_INFO.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-smooth"
              >
                <Phone className="h-5 w-5" />
              </a>
              <AuthButton />
              <Button onClick={handleBooking} className="gradient-primary text-white">
                <Calendar className="mr-2 h-4 w-4" />
                Reservar Ahora
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-foreground hover:text-primary transition-smooth"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 w-80 h-full bg-background z-50 lg:hidden shadow-elegant transform transition-smooth overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <Link
                  to="/"
                  className="flex items-center space-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-white font-display font-bold text-xl">P</span>
                  </div>
                  <span className="font-display font-bold text-xl text-foreground">
                    Pitaya Nails
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block text-lg font-medium text-foreground hover:text-primary transition-smooth"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-8 space-y-4">
                <div className="flex justify-center mb-4">
                  <AuthButton />
                </div>
                <Button
                  onClick={handleBooking}
                  className="w-full gradient-primary text-white"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Reservar Ahora
                </Button>

                <div className="flex items-center justify-center space-x-4 pt-4 border-t border-border">
                  <a
                    href={SALON_INFO.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition-smooth"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a
                    href={SALON_INFO.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition-smooth"
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a
                    href={SALON_INFO.social.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition-smooth"
                  >
                    <Phone className="h-6 w-6" />
                  </a>
                </div>

                <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {SALON_INFO.phone}
                  </p>
                  <p>{SALON_INFO.address}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
