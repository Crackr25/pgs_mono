import { useState } from 'react';
import Button from './Button';

export function FormField({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  required = false,
  placeholder = '',
  options = [],
  className = ''
}) {
  const inputClasses = `form-input ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            rows={4}
            className={inputClasses}
          />
        );
      case 'select':
        return (
          <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={inputClasses}
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'file':
        return (
          <input
            type="file"
            name={name}
            onChange={onChange}
            required={required}
            multiple={placeholder === 'multiple'}
            className="block w-full text-sm text-secondary-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        );
      default:
        return (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={inputClasses}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <label className="form-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {renderInput()}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function Form({ 
  children, 
  onSubmit, 
  className = '',
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  isLoading = false
}) {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      {children}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : submitText}
        </Button>
      </div>
    </form>
  );
}
