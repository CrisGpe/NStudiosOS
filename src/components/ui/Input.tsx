import React, { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  multiline?: false;
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  multiline: true;
}

export type InputOrTextareaProps = InputProps | TextareaProps;

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputOrTextareaProps>(
  (props, ref) => {
    const {
      className = '',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      multiline,
      id,
      ...rest
    } = props;
    
    const generatedId = useId();
    const inputId = id || generatedId;
    
    const wrapperClass = 'flex flex-col gap-1.5 w-full';
    const baseInputClass = `input-impeccable w-full ${error ? 'border-rose-500/50 focus:border-rose-500' : ''} ${className}`;
    
    return (
      <div className={wrapperClass}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-slate-300">
            {label}
          </label>
        )}
        
        <div className="relative w-full">
          {!multiline && leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-slate-400">
              {leftIcon}
            </div>
          )}
          
          {multiline ? (
            <textarea
              ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
              id={inputId}
              className={`${baseInputClass} min-h-[80px] py-2`}
              {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.ForwardedRef<HTMLInputElement>}
              id={inputId}
              className={`${baseInputClass} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
              {...(rest as InputHTMLAttributes<HTMLInputElement>)}
            />
          )}
          
          {!multiline && rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={`text-xs ${error ? 'text-rose-400' : 'text-slate-400'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
