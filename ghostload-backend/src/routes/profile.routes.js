const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get  ('/',                authenticate, getProfile);
router.patch('/',                authenticate, updateProfile);
router.post ('/change-password', authenticate, changePassword);

module.exports = router;
