// db model for tracking otp verification

import mongoose from "mongoose";

const EmailVerificationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    verified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// auto-delete expired otp records after 1 hour
EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.models.EmailVerification ||
  mongoose.model("EmailVerification", EmailVerificationSchema);
