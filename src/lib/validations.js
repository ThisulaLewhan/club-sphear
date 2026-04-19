// variables for student email validation

const STUDENT_EMAIL_DOMAIN = "my.sliit.lk";
const STUDENT_EMAIL_PREFIX = (process.env.NEXT_PUBLIC_STUDENT_EMAIL_PREFIX || "it").toLowerCase();
const STUDENT_EMAIL_DIGITS = 8;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getStudentEmailFormatMessage() {
  return `Email must match this format: ${STUDENT_EMAIL_PREFIX}12345678@${STUDENT_EMAIL_DOMAIN}`;
}

// this function checks if an email looks mostly valid
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// this function checks if it matches my.sliit.lk format
export function isValidStudentEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const emailRegex = new RegExp(`^${escapeRegex(STUDENT_EMAIL_PREFIX)}\\d{${STUDENT_EMAIL_DIGITS}}@${escapeRegex(STUDENT_EMAIL_DOMAIN)}$`);
  return emailRegex.test(normalizedEmail);
}

// this function checks if it matches student ID format
export function isValidStudentId(id) {
  if (!id || String(id).trim() === '') return true;
  const regex = new RegExp(`^${escapeRegex(STUDENT_EMAIL_PREFIX)}\\d{${STUDENT_EMAIL_DIGITS}}$`, 'i');
  return regex.test(String(id).trim());
}

// this checks if the password meets security rules
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

// this is to validate full signup data
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

// this validates login attempt
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

// this checks if profile updates are valid
export function validateProfileUpdate(data) {
  const errors = {};

  if (data.name !== undefined && data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (data.bio !== undefined && data.bio.length > 500) {
    errors.bio = "Bio must be under 500 characters";
  }

  if (data.studentId !== undefined && data.studentId.trim() !== '') {
    if (!isValidStudentId(data.studentId)) {
      errors.studentId = `Student ID must be in format ${STUDENT_EMAIL_PREFIX.toUpperCase()}${"1".repeat(STUDENT_EMAIL_DIGITS)}`;
    }
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

// this validates event creation and update data
export function validateEvent(data) {
  const errors = {};

  // Title: Required, 3-100 chars
  if (!data.title || data.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  } else if (data.title.length > 100) {
    errors.title = "Title cannot exceed 100 characters";
  }

  // Description: Optional, max 2000 chars
  if (data.description && data.description.length > 2000) {
    errors.description = "Description cannot exceed 2000 characters";
  }

  // Date: Required, must be today or future
  if (!data.date) {
    errors.date = "Event date is required";
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Append T00:00:00 to parse correctly in local timezone avoiding UTC shift bugs
    const eventDate = new Date(data.date + "T00:00:00");
    if (isNaN(eventDate.getTime())) {
      errors.date = "Invalid date format";
    } else if (eventDate < today) {
      errors.date = "Event date cannot be in the past";
    }
  }

  // Start Time: Required
  if (!data.startTime) {
    errors.startTime = "Start time is required";
  }

  // End Time: Required, must be after startTime
  if (!data.endTime) {
    errors.endTime = "End time is required";
  } else if (data.startTime && data.startTime >= data.endTime) {
    errors.endTime = "End time must be after start time";
  }

  // Venue: Required
  if (!data.venue || !data.venue.trim()) {
    errors.venue = "Venue is required";
  }

  // Registration Link: Optional, must be valid URL
  if (data.registrationLink && data.registrationLink.trim()) {
    try {
      new URL(data.registrationLink);
    } catch (e) {
      errors.registrationLink = "Please enter a valid URL (e.g., https://example.com)";
    }
  }

  // Cover Image: Required
  if (data.image === null || data.image === undefined || data.image === "") {
    errors.image = "Event cover image is required";
  } else if (!(data.image instanceof Blob) && typeof data.image !== "object") {
    errors.image = `Invalid formatted image object detected. Received: ${typeof data.image}`;
  } else if (data.image.size && data.image.size > 4 * 1024 * 1024) {
    errors.image = "Image must be less than 4MB";
  } else if (data.image.type && !data.image.type.startsWith('image/')) {
    errors.image = "File must be an image";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// this function validates chat messages
export function validateChatMessage(data) {
  const errors = {};

  if (!data.content || data.content.trim().length === 0) {
    if (!data.image && !data.file) {
      errors.content = "Message cannot be empty";
    }
  } else if (data.content.length > 200) {
    errors.content = "Message cannot exceed 200 characters";
  }

  if (!data.conversationId) {
    errors.conversationId = "Missing conversation reference";
  }

  if (data.file && data.file.size > 4 * 1024 * 1024) {
    errors.file = "File must be less than 4MB";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
