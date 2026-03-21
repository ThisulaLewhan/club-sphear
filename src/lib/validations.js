/**
 * Validation Utilities
 * ====================
 * Input validation functions for auth forms and API routes.
 * Owner: Lisura (Authentication & Student Profile Module)
 */

const STUDENT_EMAIL_DOMAIN = "my.sliit.lk";
const STUDENT_EMAIL_PREFIX = (process.env.NEXT_PUBLIC_STUDENT_EMAIL_PREFIX || "it").toLowerCase();
const STUDENT_EMAIL_DIGITS = 8;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getStudentEmailFormatMessage() {
  return `Email must match this format: ${STUDENT_EMAIL_PREFIX}12345678@${STUDENT_EMAIL_DOMAIN}`;
}

/**
 * Validate email format (accepts university-style emails)
 * Accepts: name@university.ac.lk, name@uni.edu, etc.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate student registration email format
 * Required format: <prefix><9-digits>@my.sliit.lk
 * Example: it123456789@my.sliit.lk
 * @param {string} email
 * @returns {boolean}
 */
export function isValidStudentEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const emailRegex = new RegExp(`^${escapeRegex(STUDENT_EMAIL_PREFIX)}\\d{${STUDENT_EMAIL_DIGITS}}@${escapeRegex(STUDENT_EMAIL_DOMAIN)}$`);
  return emailRegex.test(normalizedEmail);
}

/**
 * Validate password strength
 * Requirements: min 6 chars, at least 1 uppercase, 1 lowercase, 1 number
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePassword(password) {
  if (!password || password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true, message: "" };
}

/**
 * Validate registration form fields
 * @param {Object} data - { name, email, password, confirmPassword }
 * @returns {{ valid: boolean, errors: Object }}
 */
export function validateRegistration(data) {
  const errors = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!data.email) {
    errors.email = "Email is required";
  } else if (!isValidStudentEmail(data.email)) {
    errors.email = getStudentEmailFormatMessage();
  }

  if (!data.password) {
    errors.password = "Password is required";
  } else {
    const pwCheck = validatePassword(data.password);
    if (!pwCheck.valid) {
      errors.password = pwCheck.message;
    }
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate login form fields
 * @param {Object} data - { email, password }
 * @returns {{ valid: boolean, errors: Object }}
 */
export function validateLogin(data) {
  const errors = {};

  if (!data.email) {
    errors.email = "Email is required";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!data.password) {
    errors.password = "Password is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate profile update fields
 * @param {Object} data - fields to update
 * @returns {{ valid: boolean, errors: Object }}
 */
export function validateProfileUpdate(data) {
  const errors = {};

  if (data.name !== undefined && data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (data.bio !== undefined && data.bio.length > 500) {
    errors.bio = "Bio must be under 500 characters";
  }

  if (data.studentId !== undefined && data.studentId.length > 20) {
    errors.studentId = "Student ID must be under 20 characters";
  }

  // Prevent role modification by students
  if (data.role !== undefined) {
    errors.role = "You cannot modify your role";
  }

  // Prevent email modification (for data consistency)
  if (data.email !== undefined) {
    errors.email = "Email cannot be changed";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
