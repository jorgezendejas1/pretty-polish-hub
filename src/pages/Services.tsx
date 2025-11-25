import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SERVICES, TEAM_MEMBERS } from '@/lib/constants';
import { Service } from '@/types';
import { ServiceCard } from '@/components/ServiceCard';
import { BookingFlow } from '@/components/BookingFlow';
import { LoyaltyBanner } from '@/components/LoyaltyBanner';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Grid, List, Calendar, DollarSign, Clock, Check } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { getBookingSchema, getBreadcrumbSchema } from '@/lib/jsonld';

const Services = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [professionalFilter, setProfessionalFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Inicio', url: 'https://pitayanails.com' },
    { name: 'Servicios', url: 'https://pitayanails.com/servicios' },
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      getBookingSchema(),
      breadcrumbSchema,
    ],
  };

  useEffect(() => {
    const serviceId = searchParams.get('service');
    if (serviceId) {
      const service = SERVICES.find((s) => s.id === serviceId);
      if (service && !selectedServices.find((s) => s.id === service.id)) {
        setSelectedServices([service]);
      }
    }
  }, [searchParams]);

  const filteredServices = useMemo(() => {
    return SERVICES.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
      const matchesProfessional = professionalFilter === 'all' || true; // All professionals can do all services
      const matchesPrice = priceRange === 'all' ||
        (priceRange === 'low' && service.price < 400) ||
        (priceRange === 'medium' && service.price >= 400 && service.price < 700) ||
        (priceRange === 'high' && service.price >= 700);
      
      return matchesSearch && matchesCategory && matchesProfessional && matchesPrice;
    });
  }, [searchTerm, categoryFilter, professionalFilter, priceRange]);

  // Autosuggest services based on search
  const suggestedServices = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    return SERVICES.filter((service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm]);

  const toggleServiceSelection = (serviceId: string) => {
    const service = SERVICES.find((s) => s.id === serviceId);
    if (!service) return;

    if (selectedServices.find((s) => s.id === serviceId)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

  const startBooking = () => {
    if (selectedServices.length === 0) return;
    setShowBookingFlow(true);
  };

  if (showBookingFlow) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <BookingFlow
          initialServices={selectedServices}
          onBack={() => setShowBookingFlow(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <SEO
        title="Servicios de Manicura y Pedicura Premium"
        description="Descubre nuestros servicios de manicura, pedicura, nail art y diseños exclusivos. Reserva tu cita online en Pitaya Nails Cancún. Desde $250 MXN."
        url="https://pitayanails.com/servicios"
        jsonLd={jsonLd}
      />
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            Servicios y Reserva
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Selecciona los servicios que deseas y reserva tu cita
          </p>
        </div>

        {/* Loyalty Banner */}
        <div className="mb-8">
          <LoyaltyBanner />
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Popover open={showSuggestions && suggestedServices.length > 0} onOpenChange={setShowSuggestions}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      placeholder="Buscar servicios... (autocomplete)"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className="pl-10"
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandList>
                      <CommandEmpty>No se encontraron servicios.</CommandEmpty>
                      <CommandGroup heading="Sugerencias">
                        {suggestedServices.map((service) => (
                          <CommandItem
                            key={service.id}
                            value={service.name}
                            onSelect={() => {
                              setSearchTerm(service.name);
                              setShowSuggestions(false);
                              toggleServiceSelection(service.id);
                            }}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{service.name}</span>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{service.duration}min</span>
                                <DollarSign className="h-3 w-3" />
                                <span>${service.price}</span>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="manicura">Manicura</SelectItem>
                <SelectItem value="pedicura">Pedicura</SelectItem>
                <SelectItem value="nail-art">Nail Art</SelectItem>
                <SelectItem value="esculturales">Esculturales</SelectItem>
                <SelectItem value="tratamientos">Tratamientos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Profesional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los profesionales</SelectItem>
                {TEAM_MEMBERS.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Precio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los precios</SelectItem>
                <SelectItem value="low">Hasta $400</SelectItem>
                <SelectItem value="medium">$400 - $700</SelectItem>
                <SelectItem value="high">Más de $700</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Services Grid/List */}
        <div
          className={
            viewMode === 'grid'
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'space-y-4'
          }
        >
          {filteredServices.map((service, index) => (
            <ScrollReveal key={service.id} delay={index * 0.1} direction="up">
              <ServiceCard
                service={service}
                onBook={startBooking}
                isSelected={!!selectedServices.find((s) => s.id === service.id)}
                onToggleSelect={toggleServiceSelection}
              />
            </ScrollReveal>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No se encontraron servicios con los filtros seleccionados.
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elegant z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {selectedServices.length} servicio{selectedServices.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{totalDuration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-semibold">${totalPrice}</span>
                </div>
              </div>
              <Button
                onClick={startBooking}
                size="lg"
                className="gradient-primary text-white w-full md:w-auto relative overflow-hidden hover-scale"
              >
                <span className="relative z-10">Reservar Cita</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
