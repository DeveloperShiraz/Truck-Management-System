import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  validationState?: 'default' | 'error' | 'success';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  validationState = 'default',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  const baseStyles = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors text-gray-900 placeholder:text-gray-400 bg-white';
  
  const stateStyles = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50',
    success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
  };

  const currentState = error ? 'error' : validationState;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${baseStyles} ${stateStyles[currentState]} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
