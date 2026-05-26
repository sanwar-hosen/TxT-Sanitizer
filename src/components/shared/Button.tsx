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
  const baseStyle = 'btn no-animation transition-all duration-200 select-none inline-flex items-center justify-center font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'btn-sm text-xs gap-1.5',
    md: 'btn-md text-sm gap-2',
    lg: 'btn-lg text-base gap-2',
  };

  const variantStyles = {
    primary: 'btn-primary text-white shadow-sm active:scale-98',
    secondary: 'bg-base-200 hover:bg-base-300 text-base-content border border-base-300 shadow-sm active:scale-98',
    outline: 'btn-outline btn-primary active:scale-98',
    ghost: 'btn-ghost text-base-content',
    'danger-outline': 'btn-outline btn-error active:scale-98',
    'danger-filled': 'btn-error text-white shadow-sm active:scale-98',
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
