import React from 'react';

export interface AlertProps {
  variant?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  message: string;
  className?: string;
  actionButton?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  className = '',
  actionButton,
}) => {
  const alertVariants = {
    info: 'alert-info',
    warning: 'alert-warning',
    error: 'alert-error',
    success: 'alert-success',
  };

  const iconNames = {
    info: 'info',
    warning: 'warning',
    error: 'error',
    success: 'check_circle',
  };

  return (
    <div className={`alert ${alertVariants[variant]} shadow-sm text-sm flex gap-3 items-start ${className}`}>
      <span className="material-symbols-outlined mt-0.5 shrink-0 select-none">
        {iconNames[variant]}
      </span>
      <div className="flex-1 text-left">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <p className="leading-relaxed">{message}</p>
      </div>
      {actionButton && (
        <div className="shrink-0">
          {actionButton}
        </div>
      )}
    </div>
  );
};
