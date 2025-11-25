import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, glow, onClick }: CardProps) {
  return (
    <div
      className={clsx(
        glow ? 'card-cyber-glow' : 'card-cyber',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
