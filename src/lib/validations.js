// shared validation logic for inputs

const STUDENT_EMAIL_DOMAIN = "my.sliit.lk";
const STUDENT_EMAIL_PREFIX = (process.env.NEXT_PUBLIC_STUDENT_EMAIL_PREFIX || "it").toLowerCase();
const STUDENT_EMAIL_DIGITS = 8;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getStudentEmailFormatMessage() {
  return `Email must match this format: ${STUDENT_EMAIL_PREFIX}12345678@${STUDENT_EMAIL_DOMAIN}`;
}

// checks if an email looks mostly valid
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// checks if it matches my.sliit.lk student email format
export function isValidStudentEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const emailRegex = new RegExp(`^${escapeRegex(STUDENT_EMAIL_PREFIX)}\\d{${STUDENT_EMAIL_DIGITS}}@${escapeRegex(STUDENT_EMAIL_DOMAIN)}$`);
  return emailRegex.test(normalizedEmail);
}

// checks if the password meets security requirements
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

// validate full signup data
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

// validate login attempt
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

// make sure profile updates are safe
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

  // cant change role
  if (data.role !== undefined) {
    errors.role = "You cannot modify your role";
  }

  // cant change email
  if (data.email !== undefined) {
    errors.email = "Email cannot be changed";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
