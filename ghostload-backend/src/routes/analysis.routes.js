const express = require('express');
const router = express.Router();
const { runAnalysis, getAnalysis, getBreakdown, getRecommendations } = require('../controllers/analysis.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/:siteId/analyze',               authenticate, runAnalysis);
router.get ('/:analysisId',                   authenticate, getAnalysis);
router.get ('/:analysisId/breakdown',         authenticate, getBreakdown);
router.get ('/:analysisId/recommendations',   authenticate, getRecommendations);

module.exports = router;
