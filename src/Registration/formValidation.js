import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

// Validation Utilities
const ValidationFeedback = ({ isValid, message, showIcon = true }) => {
  if (!message) return null;
  
  return (
    <div className="flex items-center gap-2 mt-1">
      {showIcon && (
        isValid ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )
      )}
      <p className={`text-sm ${isValid ? 'text-green-600' : 'text-red-500'}`}>
        {message}
      </p>
    </div>
  );
};

// Validation Rules
const validationRules = {
  email: {
    validate: (value) => {
      if (!value) return "Email is required";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Please enter a valid email address";
      return null;
    },
    successMessage: "Valid email address"
  },
  
  phoneNumber: {
    validate: (value) => {
      if (!value) return "Phone number is required";
      const cleanNumber = value.replace(/\D/g, '');
      if (cleanNumber.length < 10) return "Phone number must be at least 10 digits";
      return null;
    },
    successMessage: "Valid phone number"
  },

  albertaStudentNumber: {
    validate: (value) => {
      if (!value) return "Alberta Student Number is required";
      const cleanASN = value.replace(/\D/g, "");
      if (cleanASN.length !== 9) return "Alberta Student Number must be exactly 9 digits";
      return null;
    },
    successMessage: "Valid ASN number"
  },

  birthday: {
    validate: (value) => {
      if (!value) return "Birthday is required";
      const date = new Date(value);
      const now = new Date();
      if (date > now) return "Birthday cannot be in the future";
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 100);
      if (date < minDate) return "Please enter a valid birthday";
      return null;
    },
    successMessage: "Valid birthday"
  },

  schoolAddress: {
    validate: (value) => {
      if (!value) return "School selection is required";
      return null;
    },
    successMessage: "School selected"
  },

  courseId: {
    validate: (value) => {
      if (!value) return "Course selection is required";
      return null;
    },
    successMessage: "Course selected"
  },

  enrollmentYear: {
    validate: (value) => {
      if (!value) return "Enrollment year is required";
      return null;
    },
    successMessage: "Enrollment year selected"
  },

  // Add parent field validations
  parentName: {
    validate: (value) => {
      if (!value) return "Parent name is required";
      return null;
    },
    successMessage: "Parent name provided"
  },

  parentPhone: {
    validate: (value) => {
      if (!value) return "Parent phone is required";
      const cleanNumber = value.replace(/\D/g, '');
      if (cleanNumber.length < 10) return "Phone number must be at least 10 digits";
      return null;
    },
    successMessage: "Valid parent phone number"
  },

  parentEmail: {
    validate: (value) => {
      if (!value) return "Parent email is required";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Please enter a valid email address";
      return null;
    },
    successMessage: "Valid parent email address"
  }
};

// Custom Hook for Form Validation
const useFormValidation = (initialData, rules, options = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const validateField = (name, value) => {
    if (!rules[name]) return null;
    return rules[name].validate(value);
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    let validCount = 0;
    let totalFields = 0;

    Object.keys(rules).forEach(fieldName => {
      if (!options.conditionalValidation?.[fieldName] || options.conditionalValidation[fieldName]()) {
        totalFields++;
        const error = validateField(fieldName, formData[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
        } else {
          validCount++;
        }
      }
    });

    setErrors(newErrors);
    const percentage = totalFields > 0 ? (validCount / totalFields) * 100 : 0;
    setCompletionPercentage(Math.round(percentage));
    setIsValid(Object.keys(newErrors).length === 0);

    return newErrors;
  }, [formData, rules, options]);

  useEffect(() => {
    validateForm();
  }, [formData, validateForm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleBlur = (name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  return {
    formData,
    setFormData,
    errors,
    touched,
    isValid,
    completionPercentage,
    handleChange,
    handleBlur,
    validateForm,
    validateField
  };
};

export {
  ValidationFeedback,
  validationRules,
  useFormValidation
};