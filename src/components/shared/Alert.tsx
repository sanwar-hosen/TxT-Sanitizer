import React from 'react';

export interface AlertProps {
  variant?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  message: string;
  className?: string;
  actionButton?: React.ReactNode;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  className = '',
  actionButton,
  onClose,
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
    <div className={`alert relative ${alertVariants[variant]} shadow-sm text-sm flex gap-3 items-start ${onClose ? 'pr-10' : ''} ${className}`}>
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
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-lg text-on-surface-variant dark:text-[var(--text-muted)] border border-outline-variant dark:border-[var(--border)] hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400 hover:border-red-400 dark:hover:border-red-500 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
          type="button"
          aria-label="Close alert"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
