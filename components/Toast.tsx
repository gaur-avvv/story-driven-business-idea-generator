import React, { useEffect } from 'react';
import { Icon } from './Icon';

export type ToastType = 'info' | 'error' | 'success';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const config: Record<ToastType, { wrapper: string; icon: string; iconName: string }> = {
    info: { wrapper: 'border-info/40', icon: 'bg-info/12 text-info', iconName: 'info' },
    error: { wrapper: 'border-error/40', icon: 'bg-error/12 text-error', iconName: 'close' },
    success: { wrapper: 'border-success/40', icon: 'bg-success/12 text-success', iconName: 'check' },
  };

  const { wrapper, icon, iconName } = config[type];

  return (
    <div role="status" aria-live={type === 'error' ? 'assertive' : 'polite'} className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 pl-3 pr-4 py-3 rounded-2xl border bg-card shadow-xl animate-reveal ${wrapper}`}>
      <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${icon}`}>
        <Icon name={iconName} className="w-4 h-4" />
      </span>
      <span className="text-sm font-medium text-text-primary">{message}</span>
      <button onClick={onClose} className="p-1.5 hover:bg-background-tertiary rounded-full transition-colors text-text-muted" aria-label="Dismiss">
        <Icon name="close" className="w-4 h-4" />
      </button>
    </div>
  );
};
