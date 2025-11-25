import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PremiumBadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export const PremiumBadge = ({
  children,
  variant = 'primary',
  size = 'md',
  animated = true,
  className = '',
}: PremiumBadgeProps) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const variants = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-black',
    gradient: 'gradient-primary text-white',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const badgeClasses = `
    inline-flex items-center justify-center
    font-semibold rounded-full
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  if (!animated || prefersReducedMotion) {
    return <span className={badgeClasses}>{children}</span>;
  }

  return (
    <motion.span
      className={badgeClasses}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      {children}
    </motion.span>
  );
};