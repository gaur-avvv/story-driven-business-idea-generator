import React from 'react';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="card-raised flex flex-col items-center justify-center p-12 space-y-5">
      <div className="flex items-center gap-2" aria-hidden="true">
        <span className="w-2.5 h-2.5 rounded-full bg-gradient-brand animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '120ms' }}></span>
        <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '240ms' }}></span>
      </div>
      <p className="eyebrow text-text-secondary">{message}</p>
    </div>
  );
};
