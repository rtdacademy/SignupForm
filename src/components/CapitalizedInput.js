import React from 'react';
import { AlertCircle } from 'lucide-react';

const capitalizeWords = (str) => {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const CapitalizedInput = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  successMessage,
  className = ''
}) => {
  const handleChange = (e) => {
    const capitalizedValue = capitalizeWords(e.target.value);
    onChange({
      target: {
        name: e.target.name,
        value: capitalizedValue
      }
    });
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        className={`w-full p-2 border rounded-md ${
          touched && error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        required={required}
      />
      {touched && (error || successMessage) && (
        <div className="flex items-center gap-2 mt-1">
          {error ? (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-500">{error}</span>
            </>
          ) : (
            <span className="text-sm text-green-600">{successMessage}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default CapitalizedInput;