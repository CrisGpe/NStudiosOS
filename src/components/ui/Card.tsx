import React, { forwardRef, HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantClasses = {
  default: 'glass-panel',
  elevated: 'glass-panel-elevated',
  interactive: 'interactive-card',
};

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', padding = 'md', children, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`} 
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
