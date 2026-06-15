const express = require('express');
const router = express.Router();
const { createScenario, getScenarios, getScenario, deleteScenario } = require('../controllers/scenario.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate, createScenarioSchema } = require('../lib/validators/schemas');

router.post  ('/:analysisId/scenarios',        authenticate, validate(createScenarioSchema), createScenario);
router.get   ('/:analysisId/scenarios',        authenticate, getScenarios);
router.get   ('/scenarios/:scenarioId',        authenticate, getScenario);
router.delete('/scenarios/:scenarioId',        authenticate, deleteScenario);

module.exports = router;
