/**
 * Input validation utilities
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateLength = (value, fieldName, min, max) => {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  if (max && value.length > max) {
    return `${fieldName} must be at most ${max} characters`;
  }
  return null;
};

export const validateContactForm = (data) => {
  const errors = [];

  // Validate name
  const nameError = validateRequired(data.name, 'Name');
  if (nameError) errors.push(nameError);
  else {
    const lengthError = validateLength(data.name, 'Name', 2, 100);
    if (lengthError) errors.push(lengthError);
  }

  // Validate email
  const emailError = validateRequired(data.email, 'Email');
  if (emailError) errors.push(emailError);
  else if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }

  // Validate message
  const messageError = validateRequired(data.message, 'Message');
  if (messageError) errors.push(messageError);
  else {
    const lengthError = validateLength(data.message, 'Message', 10, 1000);
    if (lengthError) errors.push(lengthError);
  }

  return errors;
};

export const validateNewsletterSubscription = (data) => {
  const errors = [];

  const emailError = validateRequired(data.email, 'Email');
  if (emailError) errors.push(emailError);
  else if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }

  return errors;
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Remove potentially harmful characters
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};
