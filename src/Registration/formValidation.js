import React, { useState, useCallback, useEffect, useMemo } from 'react';
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

  gender: {
    validate: (value, options) => {
      // Skip validation if readonly
      if (options?.readOnlyFields?.gender) {
        return null;
      }
      
      if (!value) return "Gender is required";
      
      const validGenders = ['male', 'female', 'prefer-not-to-say'];
      if (!validGenders.includes(value)) {
        return "Please select a valid gender option";
      }
      
      return null;
    },
    required: true,
    successMessage: "Gender selected"
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
    validate: (value, options) => {
      // Skip validation if read-only
      if (options?.readOnlyFields?.phoneNumber) {
        return null;
      }
      
      // Required check
      if (!value || value.trim() === '') {
        return "Phone number is required";
      }

      // For international numbers, we just need to verify there's content
      // since the PhoneInput component handles formatting and validation
      if (value.length < 6) { // Minimum reasonable length for any phone number
        return "Please enter a complete phone number";
      }
      
      return null;
    },
    required: true,
    successMessage: "Valid phone number"
},

albertaStudentNumber: {
  validate: (value, options) => {
    // Only validate if conditional validation allows it
    if (!options?.conditionalValidation?.albertaStudentNumber?.()) {
      return null;
    }
    
    // First check if empty since it's required
    if (!value || value.trim() === '') {
      return "Alberta Student Number (ASN) is required";
    }
    
    // Clean the value of any non-digits
    const cleanASN = value.replace(/\D/g, "");
    
    // Validate the length
    if (cleanASN.length !== 9) {
      return "Alberta Student Number must be exactly 9 digits";
    }
    
    // Additional validation: check if it's all zeros or invalid pattern
    if (cleanASN === "000000000") {
      return "Please enter a valid Alberta Student Number";
    }
    
    // Check if it's a valid numeric value
    if (!/^\d{9}$/.test(cleanASN)) {
      return "Alberta Student Number can only contain numbers";
    }
    
    return null;
  },
  format: (value) => {
    if (!value) return '';
    
    // Remove all non-digits
    const cleanASN = value.replace(/\D/g, "");
    
    // Format as ####-####-# if we have enough digits
    if (cleanASN.length >= 4) {
      let formatted = cleanASN.slice(0, 4);
      if (cleanASN.length >= 8) {
        formatted += '-' + cleanASN.slice(4, 8);
        if (cleanASN.length >= 9) {
          formatted += '-' + cleanASN.slice(8, 9);
        }
      }
      return formatted;
    }
    
    return cleanASN;
  },
  required: true,
  successMessage: "Valid Alberta Student Number"
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
    validate: (value, options) => {
      // Skip validation if it's not required
      if (!options?.conditionalValidation?.parentPhone?.()) {
        return null;
      }

      if (!value || value.trim() === '') {
        return "Parent phone is required";
      }

      if (value.length < 6) {
        return "Please enter a complete phone number";
      }

      return null;
    },
    successMessage: "Valid parent phone number"
},

  // In your validation rules
  parentEmail: {
    validate: (value, options) => {
      // Only required for under 18
      if (options?.conditionalValidation?.parentEmail?.() && !value) {
        return "Parent email is required";
      }
      // Validate format if any value is provided, regardless of age
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Please enter a valid email address";
      }
      return null;
    },
    successMessage: "Valid parent email address"
   },

   
   country: {
    validate: (value, options) => {
      // Only validate for international students
      if (options?.formData?.studentType === 'International Student') {
        // Skip validation if the field is read-only (exists in profile)
        if (options?.readOnlyFields?.country) {
          return null;
        }
        if (!value) return "Country of origin is required";
      }
      return null;
    },
    successMessage: "Valid country selection"
  },
  
  documents: {
    validate: (value, options) => {
      // Only validate for international students
      if (options?.formData?.studentType === 'International Student') {
        // Skip validation if documents are already in profile
        if (options?.readOnlyFields?.documents) {
          return null;
        }
        
        if (!value) return "Required documents are missing";
        
        // Check required documents
        if (!value.passport) {
          return "Passport is required";
        }
        if (!value.additionalID) {
          return "Additional ID document is required";
        }
      }
      return null;
    },
    successMessage: "All required documents uploaded"
  }
   
};





const useFormValidation = (initialData, rules, options = {}) => {
  // Destructure options with defaults
  const { readOnlyFields = {}, conditionalValidation = {} } = options;

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => ({
    readOnlyFields,
    conditionalValidation
  }), [readOnlyFields, conditionalValidation]);

  // Core state
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [initialized, setInitialized] = useState(false);

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
  }, [initialData, rules, readOnlyFields, initialized]);

  // Memoize format field function
  const formatField = useCallback((name, value) => {
    // Skip formatting for read-only fields
    if (memoizedOptions.readOnlyFields[name]) {
      return value;
    }

    if (rules[name]?.format) {
      try {
        return rules[name].format(value);
      } catch (error) {
        console.error(`Formatting error for field ${name}:`, error);
        return value;
      }
    }
    return value;
  }, [rules, memoizedOptions.readOnlyFields]);

  // Memoize validate field function
  const validateField = useCallback((name, value) => {
    // If the field is readonly and has a value, consider it valid
    if (memoizedOptions.readOnlyFields[name] && value) {
      return null;
    }

    if (!rules[name]) {
      return null;
    }

    // Skip validation for optional fields that are empty
    if (!value && !rules[name].required) {
      return null;
    }

    try {
      return rules[name].validate(value, { conditionalValidation: memoizedOptions.conditionalValidation });
    } catch (error) {
      console.error(`Validation error for field ${name}:`, error);
      return `Validation error: ${error.message}`;
    }
  }, [rules, memoizedOptions]);

  // Memoize form validation function
  const validateForm = useCallback(() => {
    const newErrors = {};
    let validCount = 0;
    let totalFields = 0;

    Object.keys(rules).forEach(fieldName => {
      // Skip validation for read-only fields
      if (memoizedOptions.readOnlyFields[fieldName]) {
        if (formData[fieldName]) {
          validCount++;
        }
        totalFields++;
        return;
      }

      // Check if field should be validated based on conditional validation
      const shouldValidate = !memoizedOptions.conditionalValidation[fieldName] || 
                            memoizedOptions.conditionalValidation[fieldName]();

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

    // Batch state updates
    setErrors(prevErrors => {
      if (!_.isEqual(newErrors, prevErrors)) {
        return newErrors;
      }
      return prevErrors;
    });

    setIsValid(newIsValid);
    setCompletionPercentage(Math.round(percentage));

    return newErrors;
  }, [formData, rules, memoizedOptions, formatField, validateField]);

  // Debounced validation effect
  useEffect(() => {
    const debouncedValidation = _.debounce(() => {
      validateForm();
    }, 300);

    debouncedValidation();

    return () => {
      debouncedValidation.cancel();
    };
  }, [validateForm]);

  // Handle field blur
  const handleBlur = useCallback((name) => {
    if (!memoizedOptions.readOnlyFields[name]) {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
  }, [memoizedOptions.readOnlyFields]);

  // Update formData when initialData changes
  useEffect(() => {
    const formattedData = {};
    Object.keys(initialData).forEach(fieldName => {
      formattedData[fieldName] = formatField(fieldName, initialData[fieldName]);
    });
    setFormData(formattedData);
  }, [initialData, formatField]);

  // Memoize field status getter
  const getFieldStatus = useCallback((fieldName) => {
    // Read-only fields are always valid if they have a value
    if (memoizedOptions.readOnlyFields[fieldName]) {
      return {
        isValid: formData[fieldName] ? true : false,
        message: formData[fieldName] ? rules[fieldName]?.successMessage : null
      };
    }

    const isFieldTouched = touched[fieldName];
    const fieldError = errors[fieldName];
    const shouldValidate = !memoizedOptions.conditionalValidation[fieldName] || 
                          memoizedOptions.conditionalValidation[fieldName]();

    if (!shouldValidate) {
      return null;
    }

    return {
      isValid: isFieldTouched && !fieldError,
      message: isFieldTouched ? (fieldError || rules[fieldName]?.successMessage) : null
    };
  }, [touched, errors, memoizedOptions, rules, formData]);

  // Reset form function
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
