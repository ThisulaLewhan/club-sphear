// Feature Domain: Authentication & Access Control
// Shared Nodemailer transport utility — used by send-otp and forgot-password routes

import nodemailer from "nodemailer";

/**
 * Builds and returns a validated Nodemailer transporter.
 * Reads SMTP config from environment variables.
 * Throws a descriptive error if any required variable is missing.
 */
export function createMailTransporter() {
    const host = process.env.SMTP_HOST?.trim();
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const secure = (process.env.SMTP_SECURE || "false").trim().toLowerCase() === "true";
    // Trim the password — Vercel sometimes preserves surrounding whitespace
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();
    // Strip surrounding quotes from SMTP_FROM if present (e.g. "Club Sphear <x@y.com>")
    const rawFrom = process.env.SMTP_FROM?.trim().replace(/^["']|["']$/g, "");
    const from = rawFrom || user;

    const missing = [];
    if (!host) missing.push("SMTP_HOST");
    if (!user) missing.push("SMTP_USER");
    if (!pass) missing.push("SMTP_PASS");
    if (Number.isNaN(port)) missing.push("SMTP_PORT (must be a number)");

    if (missing.length > 0) {
        throw new Error(
            `Email service is not configured. Missing environment variables: ${missing.join(", ")}`
        );
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure,   // false for port 587 (STARTTLS), true for port 465 (SSL)
        auth: { user, pass },
        tls: {
            rejectUnauthorized: false, // allow self-signed certs in dev/staging
        },
    });

    return { transporter, from };
}
