import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger-outline' | 'danger-filled';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyle = 'btn no-animation transition-all duration-200 select-none inline-flex items-center justify-center font-medium rounded-[4px] disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'btn-sm text-xs gap-1.5',
    md: 'btn-md text-sm gap-2',
    lg: 'btn-lg text-base gap-2',
  };

  const variantStyles = {
    primary: 'btn-primary text-white border border-primary hover:border-primary-hover shadow-sm active:scale-98',
    secondary: 'bg-base-200 dark:bg-slate-700/50 hover:bg-base-300 dark:hover:bg-slate-600/60 text-base-content dark:text-slate-200 border border-base-300 dark:border-slate-600/50 shadow-sm active:scale-98',
    outline: 'bg-transparent text-primary border border-primary/30 dark:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary-hover hover:border-primary hover:scale-102 active:scale-98 transition-all duration-200 shadow-sm hover:shadow-md',
    ghost: 'btn-ghost text-base-content',
    'danger-outline': 'bg-transparent text-on-surface-variant dark:text-[var(--text-muted)] border border-outline-variant dark:border-[var(--border)] hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400 hover:border-red-400 dark:hover:border-red-500 hover:scale-102 active:scale-98 transition-all duration-200 shadow-sm hover:shadow-md',
    'danger-filled': 'btn-error text-white border border-error hover:border-error-hover shadow-sm active:scale-98',
  };

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
