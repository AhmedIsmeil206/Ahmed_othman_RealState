import { useState, useCallback } from 'react';
import { handleApiError, getOperationErrorMessage } from '../services/api';

export const useErrorHandler = (showToast = null) => {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Clear specific error
  const clearError = useCallback((field) => {
    setErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  // Set field-specific error
  const setFieldError = useCallback((field, error) => {
    const errorMessage = typeof error === 'string' ? error : handleApiError(error);
    setErrors(prev => ({ ...prev, [field]: errorMessage }));
  }, []);

  // Handle API errors with optional toast notification
  const handleError = useCallback((error, options = {}) => {
    const {
      operation,
      field,
      showToastNotification = true,
      fallbackMessage = 'An error occurred'
    } = options;

    let errorMessage;
    
    if (operation) {
      errorMessage = getOperationErrorMessage(operation, error);
    } else {
      errorMessage = handleApiError(error, fallbackMessage);
    }

    // Set field-specific error if field is provided
    if (field) {
      setFieldError(field, errorMessage);
    }

    // Show toast notification if enabled and showToast function is available
    if (showToastNotification && showToast) {
      showToast(errorMessage, 'error');
    }

    // Log error for debugging
    console.error('Error handled:', {
      operation,
      field,
      error,
      message: errorMessage
    });

    return errorMessage;
  }, [setFieldError, showToast]);

  // Wrapper for async operations with error handling
  const executeWithErrorHandling = useCallback(async (
    asyncOperation,
    options = {}
  ) => {
    const {
      operation,
      field,
      showLoadingState = true,
      onSuccess,
      onError,
      showSuccessToast = false,
      successMessage = 'Operation completed successfully'
    } = options;

    try {
      if (showLoadingState) {
        setIsLoading(true);
      }

      // Clear previous errors for this field
      if (field) {
        clearError(field);
      }

      const result = await asyncOperation();

      // Show success toast if enabled
      if (showSuccessToast && showToast) {
        showToast(successMessage, 'success');
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      return { success: true, data: result };
    } catch (error) {
      const errorMessage = handleError(error, { operation, field });
      
      // Call error callback
      if (onError) {
        onError(error, errorMessage);
      }

      return { success: false, error, message: errorMessage };
    } finally {
      if (showLoadingState) {
        setIsLoading(false);
      }
    }
  }, [handleError, clearError, showToast]);

  // Validate form fields
  const validateField = useCallback((field, value, validators = []) => {
    clearError(field);

    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        setFieldError(field, error);
        return false;
      }
    }
    return true;
  }, [clearError, setFieldError]);

  // Common validators
  const validators = {
    required: (fieldName) => (value) => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return `${fieldName} is required`;
      }
      return null;
    },
    
    email: (value) => {
      if (value && !/\S+@\S+\.\S+/.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    },
    
    minLength: (min) => (value) => {
      if (value && value.length < min) {
        return `Must be at least ${min} characters long`;
      }
      return null;
    },
    
    maxLength: (max) => (value) => {
      if (value && value.length > max) {
        return `Must be no more than ${max} characters long`;
      }
      return null;
    },
    
    numeric: (value) => {
      if (value && isNaN(value)) {
        return 'Must be a valid number';
      }
      return null;
    },
    
    phone: (value) => {
      if (value && !/^[+]?[\d\s-()]+$/.test(value)) {
        return 'Please enter a valid phone number';
      }
      return null;
    },
    
    match: (otherValue, fieldName) => (value) => {
      if (value !== otherValue) {
        return `Must match ${fieldName}`;
      }
      return null;
    }
  };

  return {
    // State
    errors,
    isLoading,
    
    // Error management
    clearErrors,
    clearError,
    setFieldError,
    handleError,
    
    // Async operation wrapper
    executeWithErrorHandling,
    
    // Validation
    validateField,
    validators,
    
    // Utilities
    hasErrors: Object.keys(errors).length > 0,
    getError: (field) => errors[field],
    hasFieldError: (field) => !!errors[field]
  };
};