/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  const isValid = password.length >= minLength;
  
  return {
    isValid,
    message: isValid 
      ? 'Password is valid' 
      : `Password must be at least ${minLength} characters`,
    strength: isValid && hasUpperCase && hasLowerCase && hasNumber 
      ? 'strong' 
      : isValid 
        ? 'medium' 
        : 'weak',
  };
};

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = `${field} is required`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate user data for CSV/Excel import
 * @param {Object} userData - User data object
 * @returns {Object} Validation result
 */
export const validateUserData = (userData) => {
  const errors = {};
  
  if (!userData.name || userData.name.trim() === '') {
    errors.name = 'Name is required';
  }
  
  if (!userData.email || !isValidEmail(userData.email)) {
    errors.email = 'Valid email is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
