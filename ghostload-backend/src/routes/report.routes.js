const express = require('express');
const router = express.Router();
const { exportPdf, exportCsv, exportShare, getReport, getByShareToken } = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/:analysisId/export/pdf',   authenticate, exportPdf);
router.post('/:analysisId/export/csv',   authenticate, exportCsv);
router.post('/:analysisId/export/share', authenticate, exportShare);
router.get ('/:reportId',                authenticate, getReport);
router.get ('/share/:shareToken',                      getByShareToken); // public

module.exports = router;
