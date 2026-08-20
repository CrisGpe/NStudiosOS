import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] h-[95vh]',
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
}: ModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Surface */}
      <div 
        className={`glass-panel-elevated relative z-10 w-full flex flex-col overflow-hidden animate-in-scale ${sizeClasses[size]} ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {(title || onClose) && <ModalHeader title={title} onClose={onClose} />}
        {children}
      </div>
    </div>
  );
};

export const ModalHeader = ({ title, onClose, className = '' }: { title?: ReactNode; onClose?: () => void; className?: string }) => (
  <div className={`flex items-center justify-between px-6 py-4 border-b border-white/5 ${className}`}>
    {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
    {onClose && (
      <button 
        onClick={onClose}
        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-auto"
        aria-label="Close modal"
      >
        <X className="h-5 w-5" />
      </button>
    )}
  </div>
);

export const ModalBody = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`px-6 py-4 overflow-y-auto flex-1 ${className}`}>
    {children}
  </div>
);

export const ModalFooter = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-slate-900/30 ${className}`}>
    {children}
  </div>
);

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
