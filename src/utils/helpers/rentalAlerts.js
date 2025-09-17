/**
 * Rental Alert System Utilities
 * Handles calculation and management of rental renewal alerts
 */

/**
 * Calculate days remaining until rental end date
 * @param {string} endDate - ISO date string
 * @returns {number} Days remaining (negative if overdue)
 */
export const calculateDaysRemaining = (endDate) => {
  if (!endDate) return null;
  
  // Get today's date at midnight in local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Parse end date and set to midnight
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  // Calculate difference in days
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Check if a studio needs renewal alert (5 days or less remaining)
 * @param {Object} studio - Studio object with rental information
 * @returns {Object} Alert information
 */
export const checkRenewalAlert = (studio) => {
  if (!studio.rental?.endDate || !studio.rental?.isRented) {
    return { needsAlert: false, daysRemaining: null, status: 'not-rented' };
  }

  const daysRemaining = calculateDaysRemaining(studio.rental.endDate);
  
  if (daysRemaining === null) {
    return { needsAlert: false, daysRemaining: null, status: 'no-end-date' };
  }

  if (daysRemaining < 0) {
    return {
      needsAlert: true,
      daysRemaining,
      status: 'overdue',
      priority: 'high',
      message: `Rental expired ${Math.abs(daysRemaining)} days ago`
    };
  }

  if (daysRemaining <= 5) {
    return {
      needsAlert: true,
      daysRemaining,
      status: 'expiring-soon',
      priority: daysRemaining <= 2 ? 'high' : 'medium',
      message: daysRemaining === 0 
        ? 'Rental expires today!' 
        : `Rental expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`
    };
  }

  return { needsAlert: false, daysRemaining, status: 'active' };
};

/**
 * Get all studios that need renewal alerts
 * @param {Array} apartments - Array of apartments with studios
 * @returns {Array} Studios that need alerts
 */
export const getStudiosNeedingRenewal = (apartments) => {
  const alertStudios = [];

  apartments.forEach(apartment => {
    if (apartment.studios && apartment.studios.length > 0) {
      apartment.studios.forEach(studio => {
        const alert = checkRenewalAlert(studio);
        if (alert.needsAlert) {
          alertStudios.push({
            ...studio,
            apartmentName: apartment.name,
            apartmentId: apartment.id,
            alert
          });
        }
      });
    }
  });

  // Sort by priority and days remaining
  return alertStudios.sort((a, b) => {
    // High priority first
    if (a.alert.priority === 'high' && b.alert.priority !== 'high') return -1;
    if (b.alert.priority === 'high' && a.alert.priority !== 'high') return 1;
    
    // Then by days remaining (most urgent first)
    return a.alert.daysRemaining - b.alert.daysRemaining;
  });
};

/**
 * Format alert message with proper styling classes
 * @param {Object} alert - Alert object from checkRenewalAlert
 * @returns {Object} Formatted alert with CSS classes
 */
export const formatAlertMessage = (alert) => {
  const baseClasses = 'alert-message';
  
  switch (alert.status) {
    case 'overdue':
      return {
        ...alert,
        className: `${baseClasses} alert-overdue`,
        icon: '🚨',
        title: 'Overdue Rental'
      };
    case 'expiring-soon':
      return {
        ...alert,
        className: `${baseClasses} alert-expiring`,
        icon: alert.daysRemaining <= 2 ? '⚠️' : '📅',
        title: 'Renewal Reminder'
      };
    default:
      return {
        ...alert,
        className: baseClasses,
        icon: 'ℹ️',
        title: 'Rental Info'
      };
  }
};