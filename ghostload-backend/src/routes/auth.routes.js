const express = require('express');
const router = express.Router();
const {
  signup, login, me, refresh,
  verifyEmail, forgotPassword, resetPassword, logout,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate, signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../lib/validators/schemas');

router.post('/signup',          validate(signupSchema),         signup);
router.post('/login',           validate(loginSchema),          login);
router.post('/logout',          authenticate,                   logout);
router.get ('/me',              authenticate,                   me);
router.post('/refresh',                                         refresh);
router.post('/verify-email',                                    verifyEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password',  validate(resetPasswordSchema),  resetPassword);

module.exports = router;
