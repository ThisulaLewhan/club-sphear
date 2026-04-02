// db model for tracking password reset OTP verification

import mongoose from "mongoose";

const PasswordResetSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    verified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// auto-delete expired records after 1 hour
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.models.PasswordReset ||
  mongoose.model("PasswordReset", PasswordResetSchema);
