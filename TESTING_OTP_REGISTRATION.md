# OTP Registration Testing Guide

## Quick Start

### 1. Start the Development Server
```bash
cd /Users/lisura/Desktop/Club\ Sphear/club-sphear
npm run dev
```

Server will run at: `http://localhost:3000`

---

## Test Registration Flow

### Step 1: Access Registration Page
1. Open browser: `http://localhost:3000/auth/register`
2. You should see the registration form with "Step 1: Email" indicator

### Step 2: Request OTP
1. Enter an email address (e.g., `test@example.com`)
2. Click "Send Verification Code"
3. **Check your terminal** - OTP will be logged like this:
   ```
   🔐 OTP for test@example.com: 123456
   ```
4. You should see: "Verification code sent! Check your inbox."

### Step 3: Verify OTP
1. The form should now show "Step 2: Verify"
2. Enter the 6-digit OTP from the terminal
3. You can paste the code using Ctrl+V (or Cmd+V on Mac)
4. Click "Verify Email"
5. You should see: "Email verified! Complete your registration."

### Step 4: Complete Registration
1. The form should now show "Step 3: Details"
2. You'll see a verified email badge showing your email
3. Fill in the details:
   - **Full Name**: Enter at least 2 characters (e.g., `John Doe`)
   - **Password**: Must have:
     - At least 6 characters
     - At least 1 uppercase letter (A-Z)
     - At least 1 lowercase letter (a-z)
     - At least 1 number (0-9)
     - Example: `SecurePass123`
   - **Confirm Password**: Must match the password field exactly
4. As you type the password, you'll see a strength meter showing:
   - Green checkmarks for met requirements
   - Red X marks for unmet requirements
5. Click "Create Account"
6. You should be redirected to `/profile` and see your registered account

---

## Error Scenarios Testing

### Test 1: Invalid Email Format
1. Enter: `invalidemail`
2. Click "Send Verification Code"
3. Expected: Error message "Please enter a valid email address"

### Test 2: Email Already Registered
1. Enter: `existing@example.com` (if already registered)
2. Click "Send Verification Code"
3. Expected: Error message "Email already registered. Please login or use a different email."

### Test 3: OTP Expiration
1. Request OTP
2. Wait 10 minutes (or modify code to test faster)
3. Enter OTP
4. Expected: Error message "OTP has expired. Please request a new code."

### Test 4: Wrong OTP
1. Request OTP (e.g., `123456`)
2. Enter wrong code (e.g., `654321`)
3. Click "Verify Email"
4. Expected: Error message "Invalid OTP. Please try again. (2 attempts remaining)"
5. Try again 2 more times
6. After 3 failed attempts: "Too many failed attempts. Please request a new code."

### Test 5: OTP Resend
1. Request OTP
2. Wait 5 seconds
3. Click "Resend Code"
4. Button should be disabled with "Resend in 55s" countdown
5. After 60 seconds, "Resend Code" button becomes clickable again
6. Check terminal for new OTP

### Test 6: Password Strength
1. Complete email verification
2. Try entering weak passwords:
   - `123456` → Missing uppercase and lowercase
   - `Password` → Missing number
   - `Pass1` → Too short (less than 6 characters)
3. The strength meter should show which requirements are missing

### Test 7: Password Mismatch
1. Complete email verification
2. Password: `SecurePass123`
3. Confirm Password: `DifferentPass123`
4. Expected: Red "Passwords do not match" message appears

### Test 8: Name Validation
1. Complete email verification
2. Full Name: `J` (only 1 character)
3. Click "Create Account"
4. Expected: Error "Name must be at least 2 characters"

---

## Console/Terminal Output Examples

### Successful OTP Generation
```
🔐 OTP for test@example.com: 847392 (Expires in 10 minutes)
```

### Database Queries (MongoDB Console)
```javascript
// Check EmailVerification records:
db.emailverifications.find()

// See all users:
db.users.find()
```

---

## Testing Across Browsers

The registration form is fully responsive. Test on:
- ✅ Desktop (full width)
- ✅ Tablet (768px)
- ✅ Mobile (375px)

Use your browser's DevTools to test responsive design:
1. Press `F12` to open DevTools
2. Click the device icon
3. Select different device presets

---

## Known Behaviors

1. **OTP in Console**: For development/testing, OTP is logged to terminal. In production, implement email service.

2. **Auto-Delete Expired Records**: EmailVerification records auto-delete from database after 1 hour.

3. **One OTP Per Email**: If user requests OTP multiple times, the old OTP is replaced.

4. **Email Normalization**: All emails are converted to lowercase before storage (e.g., `Test@Example.COM` → `test@example.com`)

5. **Auto-Login**: After successful registration, user is automatically logged in and redirected to profile.

---

## Debugging

### View OTP in Terminal
If you miss the OTP, look in your terminal window where `npm run dev` is running. Search for 🔐 emoji.

### Check MongoDB Connection
If registration fails, ensure:
1. MongoDB is running locally or connection string is valid
2. Check `.env.local` has `MONGODB_URI` set
3. Check browser console for network errors

### View Network Requests
In your browser DevTools:
1. Open Network tab (F12)
2. Go through registration steps
3. Watch the requests:
   - POST `/api/auth/send-otp`
   - POST `/api/auth/verify-otp`
   - POST `/api/auth/register`

### Check Response Status
Each request should return:
- Send OTP: `200 OK`
- Verify OTP: `200 OK`
- Register: `201 Created` (success) or `400/409` (error)

---

## Quick Registration Steps (for repeated testing)

```
1. http://localhost:3000/auth/register
2. Email: test+[timestamp]@example.com
3. Send OTP → Copy from terminal
4. Paste OTP → Verify
5. Name: John Doe
6. Password: SecurePass123
7. Confirm: SecurePass123
8. Create Account → Redirected to /profile
```

---

## Need to Reset?

To delete all users and verification records:
```javascript
// In MongoDB console:
db.emailverifications.deleteMany({})
db.users.deleteMany({})
```

Then refresh the page and start fresh testing.
