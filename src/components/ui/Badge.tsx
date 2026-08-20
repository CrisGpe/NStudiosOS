import React, { HTMLAttributes, ReactNode } from 'react';

export interface BadgeProps extends React.ComponentProps<'span'> {
  color?: 'purple' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate';
  variant?: 'solid' | 'soft' | 'outline';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

const colorMaps = {
  solid: {
    purple: 'bg-purple-600 text-white border-transparent',
    indigo: 'bg-indigo-600 text-white border-transparent',
    emerald: 'bg-emerald-600 text-white border-transparent',
    amber: 'bg-amber-600 text-white border-transparent',
    rose: 'bg-rose-600 text-white border-transparent',
    cyan: 'bg-cyan-600 text-white border-transparent',
    slate: 'bg-slate-600 text-white border-transparent',
  },
  soft: {
    purple: 'bg-purple-500/20 text-purple-300 border-transparent',
    indigo: 'bg-indigo-500/20 text-indigo-300 border-transparent',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-transparent',
    amber: 'bg-amber-500/20 text-amber-300 border-transparent',
    rose: 'bg-rose-500/20 text-rose-300 border-transparent',
    cyan: 'bg-cyan-500/20 text-cyan-300 border-transparent',
    slate: 'bg-slate-500/20 text-slate-300 border-transparent',
  },
  outline: {
    purple: 'bg-transparent text-purple-400 border-purple-500/30',
    indigo: 'bg-transparent text-indigo-400 border-indigo-500/30',
    emerald: 'bg-transparent text-emerald-400 border-emerald-500/30',
    amber: 'bg-transparent text-amber-400 border-amber-500/30',
    rose: 'bg-transparent text-rose-400 border-rose-500/30',
    cyan: 'bg-transparent text-cyan-400 border-cyan-500/30',
    slate: 'bg-transparent text-slate-400 border-slate-500/30',
  }
};

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
};

export const Badge = ({
  color = 'slate',
  variant = 'soft',
  size = 'md',
  icon,
  className = '',
  children,
  ...props
}: BadgeProps) => {
  const colorClass = colorMaps[variant][color] || colorMaps[variant].slate;
  
  return (
    <span 
      className={`badge-pill border inline-flex items-center gap-1.5 font-medium ${sizeClasses[size]} ${colorClass} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0 flex items-center">{icon}</span>}
      {children}
    </span>
  );
};
