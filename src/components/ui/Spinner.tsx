import { motion } from 'motion/react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

/** Spinner de chargement cohérent réutilisable */
export default function Spinner({ size = 'md', color = 'text-indigo-600' }: SpinnerProps) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} ${color} border-2 border-current border-t-transparent rounded-full`}
      />
    </div>
  );
}
