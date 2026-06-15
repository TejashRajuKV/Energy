const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email verification link to a new user
 */
const sendVerificationEmail = async (to, name, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `GhostLoad <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'Verify your GhostLoad account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#1F2A2D;">Welcome to GhostLoad, ${name}! 👋</h2>
        <p>Please verify your email address to get started.</p>
        <a href="${verifyUrl}" 
           style="display:inline-block;background:#D76A4A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Verify Email
        </a>
        <p style="color:#66706D;font-size:13px;margin-top:20px;">
          This link expires in 24 hours. If you didn't sign up, ignore this email.
        </p>
      </div>
    `,
  });
};

/**
 * Send a password reset email
 */
const sendPasswordResetEmail = async (to, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `GhostLoad <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'Reset your GhostLoad password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#1F2A2D;">Reset your password</h2>
        <p>Hi ${name}, we received a request to reset your GhostLoad password.</p>
        <a href="${resetUrl}" 
           style="display:inline-block;background:#D76A4A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Reset Password
        </a>
        <p style="color:#66706D;font-size:13px;margin-top:20px;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
};

/**
 * Send a team invite email
 */
const sendInviteEmail = async (to, inviterName, orgName, token) => {
  const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;
  await transporter.sendMail({
    from: `GhostLoad <${process.env.EMAIL_FROM}>`,
    to,
    subject: `${inviterName} invited you to join ${orgName} on GhostLoad`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#1F2A2D;">You've been invited!</h2>
        <p>${inviterName} has invited you to join <strong>${orgName}</strong> on GhostLoad — an energy intelligence platform for your office.</p>
        <a href="${inviteUrl}" 
           style="display:inline-block;background:#D76A4A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Accept Invitation
        </a>
        <p style="color:#66706D;font-size:13px;margin-top:20px;">
          This invite expires in 7 days.
        </p>
      </div>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInviteEmail,
};
