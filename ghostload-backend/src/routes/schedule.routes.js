const express = require('express');
const router = express.Router({ mergeParams: true });
const { getSchedule, upsertSchedule } = require('../controllers/schedule.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate, scheduleSchema } = require('../lib/validators/schemas');

// Mounted under /api/sites/:siteId/schedule via site routes
// But also accessible directly
router.get ('/:siteId/schedule', authenticate, getSchedule);
router.put ('/:siteId/schedule', authenticate, validate(scheduleSchema), upsertSchedule);

module.exports = router;
