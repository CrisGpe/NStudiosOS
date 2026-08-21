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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Surface */}
      <div 
        className={`bg-white rounded-2xl border border-slate-200 shadow-2xl text-slate-800 relative z-10 w-full flex flex-col overflow-hidden animate-in zoom-in-95 my-auto max-h-[92vh] ${sizeClasses[size]} ${className}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && <ModalHeader title={title} onClose={onClose} />}
        {children}
      </div>
    </div>
  );
};

export const ModalHeader = ({ title, onClose, className = '' }: { title?: ReactNode; onClose?: () => void; className?: string }) => (
  <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0 ${className}`}>
    {title && <h2 className="text-base font-bold text-slate-900">{title}</h2>}
    {onClose && (
      <button 
        onClick={onClose}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95 ml-auto"
        aria-label="Close modal"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

export const ModalBody = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`px-6 py-4 overflow-y-auto flex-1 text-slate-700 text-xs ${className}`}>
    {children}
  </div>
);

export const ModalFooter = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0 ${className}`}>
    {children}
  </div>
);

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
