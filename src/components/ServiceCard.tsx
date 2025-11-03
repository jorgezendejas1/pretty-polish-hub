import { Service } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Clock, DollarSign } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onBook: (serviceId: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (serviceId: string) => void;
}

export const ServiceCard = ({ service, onBook, isSelected, onToggleSelect }: ServiceCardProps) => {
  const handleClick = () => {
    if (onToggleSelect) {
      onToggleSelect(service.id);
    }
  };

  return (
    <Card
      className={`overflow-hidden transition-smooth hover:shadow-elegant cursor-pointer animate-fade-in ${
        isSelected ? 'ring-2 ring-primary shadow-elegant' : ''
      }`}
      onClick={handleClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={service.imageUrl}
          alt={service.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-xl">{service.name}</CardTitle>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{service.duration} min</span>
          </div>
          <div className="flex items-center space-x-1 text-primary font-semibold">
            <DollarSign className="h-4 w-4" />
            <span>${service.price}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {onToggleSelect ? (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className={`w-full transition-all duration-300 ${
              isSelected 
                ? 'bg-muted text-foreground hover:bg-muted/80' 
                : 'gradient-primary text-white'
            }`}
          >
            {isSelected ? 'Quitar selección' : 'Seleccionar'}
          </Button>
        ) : (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onBook(service.id);
            }}
            className="w-full gradient-primary text-white"
          >
            Reservar ahora
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
