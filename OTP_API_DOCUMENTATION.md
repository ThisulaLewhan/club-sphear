# OTP Registration API Documentation

## Overview
Three new API endpoints have been added to support email verification via OTP during user registration.

---

## Endpoints

### 1. Send OTP (`POST /api/auth/send-otp`)

Sends a 6-digit OTP to the provided email address for verification.

#### Request
```json
{
  "email": "user@example.com"
}
```

#### Response - Success (200 OK)
```json
{
  "success": true,
  "message": "Verification code sent! Check your inbox."
}
```

#### Response - Errors

**Invalid Email Format (400)**
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

**Email Already Registered (400)**
```json
{
  "success": false,
  "message": "Email already registered. Please login or use a different email."
}
```

**Server Error (500)**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

#### Implementation Details
- Generates a random 6-digit OTP
- Validates email format using regex pattern
- Checks if email is already registered in the User collection
- Stores OTP in EmailVerification collection with:
  - Email (unique, lowercase)
  - OTP (6 digits)
  - Verified flag (false initially)
  - Attempts counter (0)
  - Expiration time (10 minutes from now)
- Logs OTP to console for development (replace with email service in production)
- Previous OTP for same email is automatically replaced

#### Database Changes
```javascript
// Created EmailVerification document
{
  _id: ObjectId,
  email: "user@example.com",
  otp: "847392",
  verified: false,
  attempts: 0,
  expiresAt: ISODate("2024-03-07T16:20:00Z"),
  createdAt: ISODate("2024-03-07T16:10:00Z"),
  updatedAt: ISODate("2024-03-07T16:10:00Z")
}
```

---

### 2. Verify OTP (`POST /api/auth/verify-otp`)

Verifies the OTP provided by the user and marks the email as verified.

#### Request
```json
{
  "email": "user@example.com",
  "otp": "847392"
}
```

#### Response - Success (200 OK)
```json
{
  "success": true,
  "message": "Email verified successfully! You can now complete your registration.",
  "verified": true
}
```

#### Response - Errors

**Missing Email or OTP (400)**
```json
{
  "success": false,
  "message": "Email and OTP are required"
}
```

**OTP Not Found (400)**
```json
{
  "success": false,
  "message": "OTP not found. Please request a new code."
}
```

**OTP Expired (400)**
```json
{
  "success": false,
  "message": "OTP has expired. Please request a new code."
}
```

**Invalid OTP - First Attempt (400)**
```json
{
  "success": false,
  "message": "Invalid OTP. Please try again. (2 attempts remaining)"
}
```

**Invalid OTP - Second Attempt (400)**
```json
{
  "success": false,
  "message": "Invalid OTP. Please try again. (1 attempt remaining)"
}
```

**Too Many Failed Attempts (400)**
```json
{
  "success": false,
  "message": "Too many failed attempts. Please request a new code."
}
```

**Server Error (500)**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

#### Implementation Details
- Finds the EmailVerification record for the email
- Checks if OTP exists
- Validates OTP hasn't expired (compares with expiresAt timestamp)
- Verifies attempt count hasn't exceeded 3
- Compares provided OTP with stored OTP (case-sensitive)
- On mismatch, increments attempts counter
- On match, sets verified flag to true
- Automatically deletes expired records

#### Database Changes
```javascript
// After verification, EmailVerification document is updated to:
{
  _id: ObjectId,
  email: "user@example.com",
  otp: "847392",
  verified: true,              // Changed from false
  attempts: 0,                 // Remains unchanged if correct
  expiresAt: ISODate("2024-03-07T16:20:00Z"),
  createdAt: ISODate("2024-03-07T16:10:00Z"),
  updatedAt: ISODate("2024-03-07T16:15:00Z")  // Updated timestamp
}
```

---

### 3. Register (`POST /api/auth/register`)

Creates a new user account after email verification and password validation.

#### Request
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

#### Response - Success (201 Created)
```json
{
  "success": true,
  "message": "Registration successful! Welcome to Club Sphear.",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "student"
  }
}
```

#### Response - Errors

**Email Not Verified (400)**
```json
{
  "success": false,
  "message": "Email must be verified before registration. Please verify your email with OTP first.",
  "errors": {
    "email": "Email not verified"
  }
}
```

**Email Already Registered (409)**
```json
{
  "success": false,
  "message": "An account with this email already exists",
  "errors": {
    "email": "Email already in use"
  }
}
```

**Validation Errors (400)**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": "Name must be at least 2 characters",
    "password": "Password must contain at least one uppercase letter",
    "confirmPassword": "Passwords do not match"
  }
}
```

**Server Error (500)**
```json
{
  "success": false,
  "message": "Internal server error. Please try again."
}
```

#### Implementation Details
- Validates all required fields (name, email, password, confirmPassword)
- Checks EmailVerification record exists and verified flag is true
- Prevents duplicate email registration
- Hashes password using bcrypt (12 salt rounds)
- Creates User record with:
  - Sanitized name (trimmed)
  - Normalized email (lowercase, trimmed)
  - Hashed password
  - Role: "student" (forced, cannot be overridden)
- Automatically deletes EmailVerification record after successful registration
- Creates JWT token and sets auth cookie
- Logs user in automatically
- Never exposes password in response

#### Database Changes
```javascript
// New User document created
{
  _id: ObjectId,
  name: "John Doe",
  email: "user@example.com",
  password: "$2a$12$...", // bcrypt hashed
  role: "student",
  university: "",
  studentId: "",
  bio: "",
  clubId: null,
  createdAt: ISODate("2024-03-07T16:15:00Z"),
  updatedAt: ISODate("2024-03-07T16:15:00Z")
}

// EmailVerification record is deleted
```

---

## Validation Rules

### Email Validation
- Required field
- Must match pattern: `[username]@[domain].[extension]`
- Case-insensitive comparison
- Normalized to lowercase for storage
- Must not already exist in User collection

### OTP Validation
- 6-digit numeric string
- Case-sensitive (if letter OTP added in future)
- Must not be expired (checked against expiresAt)
- Maximum 3 failed verification attempts
- Auto-deleted after 1 hour (TTL index on expiresAt)

### Password Validation
- Minimum 6 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)

### Name Validation
- Minimum 2 characters
- Trimmed whitespace
- No length maximum

### Password Confirmation
- Must exactly match the password field
- Case-sensitive comparison

---

## Security Features

### Data Protection
- All passwords hashed with bcrypt (12 salt rounds)
- All emails normalized (lowercase) before storage
- Sensitive data never exposed in API responses
- All inputs validated server-side

### Attack Prevention
- Attempt limiting: 3 failed OTP attempts
- OTP expiration: 10 minutes
- Rate limiting: Implement at reverse proxy level (recommended)
- CSRF protection: Use Next.js built-in CSRF tokens (if enabled)
- XSS protection: React JSX escapes by default

### Database Security
- Unique email index prevents duplicates
- TTL index auto-deletes expired OTP records
- Password hashing ensures cannot be reversed
- No sensitive data in logs

---

## Error Handling

### HTTP Status Codes
- `200 OK`: Successful OTP send or verify
- `201 Created`: Successful user registration
- `400 Bad Request`: Validation errors, invalid input, or business logic errors
- `409 Conflict`: Email already exists
- `500 Internal Server Error`: Unexpected server error

### Error Response Format
All error responses follow consistent format:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": {
    "fieldName": "Field-specific error message" // Optional
  }
}
```

### Client-Side Error Handling
The RegisterForm component:
- Displays server errors in alert boxes
- Shows field-specific errors below input fields
- Prevents form submission on validation errors
- Provides real-time feedback on password strength
- Shows attempt counters for OTP verification

---

## Request/Response Examples

### Complete Registration Flow

**Step 1: Request OTP**
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'
```

Response:
```json
{
  "success": true,
  "message": "Verification code sent! Check your inbox."
}
```

**Step 2: Verify OTP**
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "otp": "847392"}'
```

Response:
```json
{
  "success": true,
  "message": "Email verified successfully!",
  "verified": true
}
```

**Step 3: Complete Registration**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Registration successful! Welcome to Club Sphear.",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

## Deployment Notes

### Production Checklist
- [ ] Replace console.log OTP with actual email service
- [ ] Configure SMTP/SendGrid credentials in environment variables
- [ ] Enable HTTPS (enforced by Next.js)
- [ ] Implement rate limiting at reverse proxy
- [ ] Set up monitoring for email delivery failures
- [ ] Test email deliverability (spam folder risks)
- [ ] Implement OTP retry logic with backoff
- [ ] Add analytics tracking for registration funnel

### Environment Variables Required
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
# For email service (when implemented):
SENDGRID_API_KEY=SG.xxxxx
# or
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@clubsphear.com
```

---

## Models

### EmailVerification Schema
```javascript
{
  email: String (unique, lowercase),
  otp: String (6 digits),
  verified: Boolean (default: false),
  attempts: Number (default: 0),
  expiresAt: Date (10 minutes from creation),
  timestamps: true
}
```

### User Schema (Extended)
```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, bcrypt hashed),
  role: String (enum: ["student", "club", "admin", "mainAdmin"], default: "student"),
  university: String (default: ""),
  studentId: String (default: ""),
  bio: String (default: ""),
  clubId: ObjectId (ref: "Club"),
  timestamps: true
}
```

---

## Troubleshooting

### OTP Not Received in Console
- Check terminal where `npm run dev` is running
- Search for 🔐 emoji in output
- Ensure you're on the correct terminal window

### Email Already Registered Error on New Email
- Clear browser cookies and retry
- Check if email exists in MongoDB
- Verify email is normalized (lowercase)

### OTP Verification Always Fails
- Ensure OTP hasn't expired (10-minute window)
- Check OTP matches exactly (case-sensitive)
- Verify email matches the one OTP was sent to

### Registration Always Redirects to Email Step
- Clear browser cache
- Check if email was actually verified in database
- Ensure EmailVerification record exists with verified: true

---

## Future Enhancements

- [ ] SMS OTP option
- [ ] Email OTP with HTML templates
- [ ] Configurable OTP expiration time
- [ ] Resend cooldown period configuration
- [ ] Rate limiting per IP address
- [ ] Registration analytics dashboard
- [ ] Support for multiple verification methods
- [ ] Two-factor authentication (2FA) for login
