const bcrypt = require('bcryptjs');
const prisma = require('../lib/db/prisma');
const { generateTokens, verifyRefreshToken } = require('../lib/auth/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');
const { generateToken, slugify, hoursFromNow } = require('../lib/utils');

// ─────────────────────────────────────────────────────────
// POST /api/auth/signup
// ─────────────────────────────────────────────────────────
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verifyToken = generateToken();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      authProvider: 'email',
      resetToken: verifyToken,
      resetTokenExpiresAt: hoursFromNow(24),
    },
    select: { id: true, name: true, email: true },
  });

  // Send verification email (non-blocking)
  sendVerificationEmail(email, name, verifyToken).catch(console.error);

  const { accessToken, refreshToken } = generateTokens(user);

  res.status(201).json({
    message: 'Account created. Please check your email to verify.',
    user,
    accessToken,
    refreshToken,
  });
};

// ─────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { accessToken, refreshToken } = generateTokens(user);

  // Fetch the user's primary org
  const membership = await prisma.orgMember.findFirst({
    where: { userId: user.id },
    include: { organization: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: 'asc' },
  });

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      preferredCurrency: user.preferredCurrency,
      timezone: user.timezone,
      emailVerifiedAt: user.emailVerifiedAt,
    },
    organization: membership?.organization || null,
    role: membership?.role || null,
    accessToken,
    refreshToken,
  });
};

// ─────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────
const me = async (req, res) => {
  const memberships = await prisma.orgMember.findMany({
    where: { userId: req.user.id },
    include: { organization: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: 'asc' },
  });

  res.json({
    user: req.user,
    organizations: memberships.map((m) => ({
      ...m.organization,
      role: m.role,
    })),
  });
};

// ─────────────────────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────────────────────
const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  const decoded = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  const tokens = generateTokens(user);
  res.json(tokens);
};

// ─────────────────────────────────────────────────────────
// POST /api/auth/verify-email
// ─────────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiresAt: { gt: new Date() },
      emailVerifiedAt: null,
    },
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired verification token' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });

  res.json({ message: 'Email verified successfully' });
};

// ─────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to prevent user enumeration
  if (!user) return res.json({ message: 'If that email is registered, a reset link has been sent.' });

  const token = generateToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: token,
      resetTokenExpiresAt: hoursFromNow(1),
    },
  });

  sendPasswordResetEmail(email, user.name, token).catch(console.error);
  res.json({ message: 'If that email is registered, a reset link has been sent.' });
};

// ─────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });

  res.json({ message: 'Password reset successfully. You can now log in.' });
};

// ─────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────
const logout = (req, res) => {
  // Stateless JWT: client discards tokens
  // If using httpOnly cookies, clear them here
  res.json({ message: 'Logged out successfully' });
};

module.exports = { signup, login, me, refresh, verifyEmail, forgotPassword, resetPassword, logout };
