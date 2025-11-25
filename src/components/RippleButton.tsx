import { useState, MouseEvent } from 'react';
import { Button, ButtonProps } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export const RippleButton = ({ children, onClick, className, ...props }: ButtonProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      className={`relative overflow-hidden ${className || ''}`}
    >
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
            initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
            animate={{ width: 300, height: 300, opacity: [1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </AnimatePresence>
      {children}
    </Button>
  );
};
