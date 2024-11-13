import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import _ from 'lodash';

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

const validationRules = {
  firstName: {
    validate: (value) => {
      if (!value) return "First name is required";
      if (value.length < 2) return "First name must be at least 2 characters";
      if (!/^[a-zA-Z\s-']+$/.test(value)) return "First name can only contain letters, spaces, hyphens and apostrophes";
      return null;
    },
    format: (value) => {
      return value?.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ') || '';
    },
    successMessage: "Valid first name"
  },

  lastName: {
    validate: (value) => {
      if (!value) return "Last name is required"; 
      if (value.length < 2) return "Last name must be at least 2 characters";
      if (!/^[a-zA-Z\s-']+$/.test(value)) return "Last name can only contain letters, spaces, hyphens and apostrophes";
      return null;
    },
    format: (value) => {
      return value?.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ') || '';
    },
    successMessage: "Valid last name"
  },

  preferredFirstName: {
    validate: (value, options) => {
      // Only validate if usePreferredFirstName is true
      if (!options?.conditionalValidation?.preferredFirstName?.()) {
        return null;
      }
      if (!value) return "Preferred first name is required";
      if (value.length < 2) return "Preferred first name must be at least 2 characters";
      if (!/^[a-zA-Z\s-']+$/.test(value)) return "Preferred first name can only contain letters, spaces, hyphens and apostrophes";
      return null;
    },
    format: (value) => {
      return value?.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ') || '';
    },
    successMessage: "Valid preferred first name"
  },

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

  parentFirstName: {
    validate: (value, options) => {
      if (options?.conditionalValidation?.parentFirstName?.() && !value) {
        return 'Parent first name is required';
      }
      if (value && value.length < 2) {
        return 'Parent first name must be at least 2 characters';
      }
      return null;
    },
    format: (value) => value ? value.trim() : '',
    successMessage: 'Valid parent first name'
  },
  
  parentLastName: {
    validate: (value, options) => {
      if (options?.conditionalValidation?.parentLastName?.() && !value) {
        return 'Parent last name is required';
      }
      if (value && value.length < 2) {
        return 'Parent last name must be at least 2 characters';
      }
      return null;
    },
    format: (value) => value ? value.trim() : '',
    successMessage: 'Valid parent last name'
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

const useFormValidation = (initialData, rules, options = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [initialized, setInitialized] = useState(false);

  // Add readOnlyFields to options type
  const { readOnlyFields = {}, conditionalValidation = {} } = options;

  // Initialize touched state for fields with values
  useEffect(() => {
    if (!initialized) {
      const initialTouched = {};
      let hasInitialValues = false;

      Object.keys(initialData).forEach(fieldName => {
        // Mark read-only fields as touched and valid
        if (readOnlyFields[fieldName]) {
          initialTouched[fieldName] = true;
          hasInitialValues = true;
        }
        // Mark fields with initial values as touched
        else if (initialData[fieldName] && rules[fieldName]) {
          initialTouched[fieldName] = true;
          hasInitialValues = true;
        }
      });

      if (hasInitialValues) {
        setTouched(prev => ({
          ...prev,
          ...initialTouched
        }));
      }

      setInitialized(true);
    }
  }, [initialData, rules, initialized, readOnlyFields]);

  // Define validateField with read-only check
  const validateField = useCallback((name, value) => {
    // If the field is readonly and has a value, consider it valid
    if (readOnlyFields[name] && value) {
      return null;
    }
    
    if (!rules[name]) return null;
    
    // Skip validation for optional fields that are empty
    if (!value && !rules[name].required) {
      return null;
    }
    
    try {
      return rules[name].validate(value, { conditionalValidation });
    } catch (error) {
      console.error(`Validation error for field ${name}:`, error);
      return `Validation error: ${error.message}`;
    }
  }, [rules, readOnlyFields, conditionalValidation]);

  // Format field value if formatter exists
  const formatField = useCallback((name, value) => {
    // Skip formatting for read-only fields
    if (readOnlyFields[name]) return value;

    if (rules[name]?.format) {
      try {
        return rules[name].format(value);
      } catch (error) {
        console.error(`Formatting error for field ${name}:`, error);
        return value;
      }
    }
    return value;
  }, [rules, readOnlyFields]);

  // Enhanced validation logic with read-only field handling
  const validateForm = useCallback(() => {
    const newErrors = {};
    let validCount = 0;
    let totalFields = 0;

    Object.keys(rules).forEach(fieldName => {
      // Skip validation for read-only fields
      if (readOnlyFields[fieldName]) {
        if (formData[fieldName]) {
          validCount++;
        }
        totalFields++;
        return;
      }

      // Check if field should be validated based on conditional validation
      const shouldValidate = !conditionalValidation[fieldName] || 
                            conditionalValidation[fieldName]();

      if (shouldValidate) {
        totalFields++;
        const formattedValue = formatField(fieldName, formData[fieldName]);
        const error = validateField(fieldName, formattedValue);

        if (error) {
          newErrors[fieldName] = error;
        } else {
          validCount++;
        }
      }
    });

    const percentage = totalFields > 0 ? (validCount / totalFields) * 100 : 0;
    const newIsValid = Object.keys(newErrors).length === 0;

    setErrors(prevErrors => {
      if (!_.isEqual(newErrors, prevErrors)) {
        return newErrors;
      }
      return prevErrors;
    });

    setIsValid(newIsValid);
    setCompletionPercentage(Math.round(percentage));

    return newErrors;
  }, [formData, rules, readOnlyFields, conditionalValidation, validateField, formatField]);

  // Validate on mount and when dependencies change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateForm();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [validateForm, formData, conditionalValidation]);

  // Handle field blur events
  const handleBlur = useCallback((name) => {
    // Don't mark read-only fields as touched
    if (!readOnlyFields[name]) {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
  }, [readOnlyFields]);

  // Update formData when initialData changes
  useEffect(() => {
    const formattedData = {};
    Object.keys(initialData).forEach(fieldName => {
      formattedData[fieldName] = formatField(fieldName, initialData[fieldName]);
    });
    setFormData(formattedData);
  }, [initialData, formatField]);

  // Get validation status for a specific field
  const getFieldStatus = useCallback((fieldName) => {
    // Read-only fields are always valid if they have a value
    if (readOnlyFields[fieldName]) {
      return {
        isValid: formData[fieldName] ? true : false,
        message: formData[fieldName] ? rules[fieldName]?.successMessage : null
      };
    }

    const isFieldTouched = touched[fieldName];
    const fieldError = errors[fieldName];
    const shouldValidate = !conditionalValidation[fieldName] || 
                          conditionalValidation[fieldName]();

    if (!shouldValidate) {
      return null;
    }

    return {
      isValid: isFieldTouched && !fieldError,
      message: isFieldTouched ? (fieldError || rules[fieldName]?.successMessage) : null
    };
  }, [touched, errors, conditionalValidation, rules, readOnlyFields, formData]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setIsValid(false);
    setCompletionPercentage(0);
    setInitialized(false);
  }, [initialData]);

  return {
    formData,
    setFormData,
    errors,
    touched,
    isValid,
    completionPercentage,
    handleBlur,
    validateForm,
    validateField,
    formatField,
    getFieldStatus,
    resetForm
  };
};

export {
  ValidationFeedback,
  validationRules,
  useFormValidation
};
