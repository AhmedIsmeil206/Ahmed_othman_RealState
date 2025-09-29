/**
 * Phone number formatting utilities for Egyptian phone numbers
 * Handles phone numbers without requiring +2 prefix from user input
 */

/**
 * Formats a phone number for display (adds +20 if not present)
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Formatted phone number with +20 prefix
 */
export const formatPhoneForDisplay = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all spaces, dashes, parentheses
  const cleaned = phoneNumber.replace(/[\s\-()]/g, '');
  
  // If already has +20, return as is
  if (cleaned.startsWith('+20')) {
    return cleaned;
  }
  
  // If starts with 20, add +
  if (cleaned.startsWith('20')) {
    return `+${cleaned}`;
  }
  
  // If starts with 0, replace with +20
  if (cleaned.startsWith('0')) {
    return `+2${cleaned}`;
  }
  
  // If starts with 1 (Egyptian mobile format), add +20
  if (cleaned.startsWith('1') && cleaned.length === 10) {
    return `+20${cleaned}`;
  }
  
  // Otherwise, assume it's Egyptian mobile and add +20
  return `+20${cleaned}`;
};

/**
 * Formats a phone number for API submission (ensures +20 prefix)
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Phone number formatted for API
 */
export const formatPhoneForAPI = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all spaces, dashes, parentheses
  const cleaned = phoneNumber.replace(/[\s\-()]/g, '');
  
  // If already has +20, return as is
  if (cleaned.startsWith('+20')) {
    return cleaned;
  }
  
  // If starts with 20, add +
  if (cleaned.startsWith('20')) {
    return `+${cleaned}`;
  }
  
  // If starts with 0, replace with +20
  if (cleaned.startsWith('0')) {
    return `+2${cleaned}`;
  }
  
  // If starts with 1 (Egyptian mobile format), add +20
  if (cleaned.startsWith('1') && cleaned.length === 10) {
    return `+20${cleaned}`;
  }
  
  // Otherwise, assume it's Egyptian mobile and add +20
  return `+20${cleaned}`;
};

/**
 * Normalizes user input for phone numbers (removes +2 requirement)
 * @param {string} phoneNumber - The user input phone number
 * @returns {string} - Normalized phone number (without +20 for user input)
 */
export const normalizePhoneInput = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all spaces, dashes, parentheses
  const cleaned = phoneNumber.replace(/[\s\-()]/g, '');
  
  // If has +20, remove it for user input
  if (cleaned.startsWith('+20')) {
    return cleaned.substring(3);
  }
  
  // If starts with 20, remove it
  if (cleaned.startsWith('20')) {
    return cleaned.substring(2);
  }
  
  // If starts with 0, remove it (Egyptian local format)
  if (cleaned.startsWith('0')) {
    return cleaned.substring(1);
  }
  
  // Return as is if it's already in the right format (1xxxxxxxxx)
  return cleaned;
};

/**
 * Validates Egyptian phone number
 * @param {string} phoneNumber - The phone number to validate
 * @returns {object} - Validation result with isValid and error
 */
export const validateEgyptianPhone = (phoneNumber) => {
  if (!phoneNumber || !phoneNumber.trim()) {
    return {
      isValid: false,
      error: 'Phone number is required'
    };
  }

  const cleaned = phoneNumber.replace(/[\s\-()]/g, '');
  
  // Allow various formats:
  // 1xxxxxxxxx (10 digits starting with 1)
  // 01xxxxxxxxx (11 digits starting with 01)
  // 201xxxxxxxxx (12 digits starting with 201)
  // +201xxxxxxxxx (13 characters starting with +201)
  
  const patterns = [
    /^1[0-9]{9}$/, // 1xxxxxxxxx (10 digits)
    /^01[0-9]{9}$/, // 01xxxxxxxxx (11 digits)
    /^201[0-9]{9}$/, // 201xxxxxxxxx (12 digits)
    /^\+201[0-9]{9}$/ // +201xxxxxxxxx (13 characters)
  ];
  
  const isValid = patterns.some(pattern => pattern.test(cleaned));
  
  if (!isValid) {
    return {
      isValid: false,
      error: 'Please enter a valid Egyptian mobile number (e.g., 1xxxxxxxxx, 01xxxxxxxxx)'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

/**
 * Formats phone number for display in UI (user-friendly format)
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - User-friendly formatted phone number
 */
export const formatPhoneForUI = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  const formatted = formatPhoneForDisplay(phoneNumber);
  
  // Add spacing for better readability: +20 1XX XXX XXXX
  if (formatted.startsWith('+20') && formatted.length === 13) {
    return `${formatted.substring(0, 3)} ${formatted.substring(3, 6)} ${formatted.substring(6, 9)} ${formatted.substring(9)}`;
  }
  
  return formatted;
};

/**
 * Creates a WhatsApp URL with the formatted phone number
 * @param {string} phoneNumber - The phone number
 * @param {string} message - Optional pre-filled message
 * @returns {string} - WhatsApp URL
 */
export const createWhatsAppURL = (phoneNumber, message = '') => {
  const formattedPhone = formatPhoneForAPI(phoneNumber);
  // Remove + from phone number for WhatsApp URL
  const whatsappPhone = formattedPhone.replace('+', '');
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${whatsappPhone}${message ? `?text=${encodedMessage}` : ''}`;
};