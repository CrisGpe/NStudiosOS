import React, { useState, useRef, useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface InlineDeleteConfirmProps {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  triggerIcon?: React.ReactNode;
  triggerClassName?: string;
  align?: 'left' | 'right' | 'center';
  placement?: 'top' | 'bottom' | 'auto';
  disabled?: boolean;
}

export const InlineDeleteConfirm: React.FC<InlineDeleteConfirmProps> = ({
  title = '¿Eliminar elemento?',
  description,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  triggerIcon,
  triggerClassName,
  align = 'right',
  placement = 'auto',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [calculatedPlacement, setCalculatedPlacement] = useState<'top' | 'bottom'>('top');
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-detect whether to open upward or downward based on viewport space
  useEffect(() => {
    if (isOpen && containerRef.current) {
      if (placement === 'top') {
        setCalculatedPlacement('top');
      } else if (placement === 'bottom') {
        setCalculatedPlacement('bottom');
      } else {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        // If less than 140px below, open upwards
        if (spaceBelow < 140) {
          setCalculatedPlacement('top');
        } else {
          setCalculatedPlacement('bottom');
        }
      }
    }
  }, [isOpen, placement]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (err) {
      console.error('Error during deletion:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  const placementClasses = {
    top: 'bottom-full mb-2 origin-bottom shadow-2xl animate-in zoom-in-95 fade-in slide-in-from-bottom-2 duration-150',
    bottom: 'top-full mt-2 origin-top shadow-2xl animate-in zoom-in-95 fade-in slide-in-from-top-2 duration-150',
  };

  return (
    <div
      className={`relative inline-block text-left ${isOpen ? 'z-[70]' : ''}`}
      ref={containerRef}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || isDeleting}
        className={
          triggerClassName ||
          'p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors'
        }
        title={title}
      >
        {triggerIcon || <Trash2 className="w-3.5 h-3.5" />}
      </button>

      {/* Contextual Popover */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute z-[80] w-64 rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-3.5 text-slate-800 ring-1 ring-black/5 ${alignmentClasses[align]} ${placementClasses[calculatedPlacement]}`}
        >
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs text-slate-900 leading-tight">{title}</h4>
              {description && (
                <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5" title={description}>
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 mt-3 pt-2.5 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="px-2.5 py-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold transition-colors cursor-pointer text-[11px]"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1 text-[11px] disabled:opacity-50"
            >
              {isDeleting ? (
                <span>Eliminando...</span>
              ) : (
                <>
                  <Trash2 className="w-3 h-3" />
                  <span>{confirmLabel}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
