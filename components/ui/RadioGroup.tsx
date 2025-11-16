import React from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  label: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  required = false,
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              value === option.value
                ? 'border-blue-500 bg-blue-50'
                : error
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3 flex-1">
              <span className="block text-sm font-medium text-gray-900">
                {option.label}
              </span>
              {option.description && (
                <span className="block text-sm text-gray-500 mt-1">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
