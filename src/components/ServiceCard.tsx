import { Service } from '@/types';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Clock, DollarSign } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { RippleButton } from './RippleButton';

interface ServiceCardProps {
  service: Service;
  onBook: (serviceId: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (serviceId: string) => void;
}

export const ServiceCard = ({ service, onBook, isSelected, onToggleSelect }: ServiceCardProps) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleClick = () => {
    if (onToggleSelect) {
      onToggleSelect(service.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXVal = ((y - centerY) / centerY) * -10;
    const rotateYVal = ((x - centerX) / centerX) * 10;
    setRotateX(rotateXVal);
    setRotateY(rotateYVal);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card
        className={`overflow-hidden transition-smooth hover:shadow-elegant cursor-pointer animate-fade-in ${
          isSelected ? 'ring-2 ring-primary shadow-elegant' : ''
        }`}
        onClick={handleClick}
        style={{ transformStyle: 'preserve-3d' }}
      >
      <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
        <OptimizedImage
          src={service.imageUrl}
          alt={service.name}
          className="w-full h-full"
        />
        {isSelected && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        )}
      </div>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-base sm:text-lg md:text-xl">{service.name}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{service.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{service.duration} min</span>
          </div>
          <div className="flex items-center space-x-1 text-primary font-semibold">
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>${service.price}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 md:p-6 pt-0">
        {onToggleSelect ? (
          <RippleButton
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className={`w-full transition-all duration-300 text-xs sm:text-sm ${
              isSelected 
                ? 'bg-muted text-foreground hover:bg-muted/80' 
                : 'gradient-primary text-white'
            }`}
          >
            {isSelected ? 'Quitar selección' : 'Seleccionar'}
          </RippleButton>
        ) : (
          <RippleButton
            onClick={(e) => {
              e.stopPropagation();
              onBook(service.id);
            }}
            className="w-full gradient-primary text-white text-xs sm:text-sm"
          >
            Reservar ahora
          </RippleButton>
        )}
      </CardFooter>
    </Card>
    </motion.div>
  );
};
