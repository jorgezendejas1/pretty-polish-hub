import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}

export const ScrollReveal = ({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up' 
}: ScrollRevealProps) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1, triggerOnce: true });

  const variants = {
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 },
    left: { x: 50, opacity: 0 },
    right: { x: -50, opacity: 0 },
    fade: { opacity: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={variants[direction]}
      animate={isVisible ? { x: 0, y: 0, opacity: 1 } : variants[direction]}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
