const express = require('express');
const router = express.Router();
const { getEquipment, createEquipment, updateEquipment, deleteEquipment } = require('../controllers/equipment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate, createEquipmentSchema } = require('../lib/validators/schemas');

router.get   ('/:siteId/equipment',            authenticate, getEquipment);
router.post  ('/:siteId/equipment',            authenticate, validate(createEquipmentSchema), createEquipment);
router.patch ('/equipment/:equipmentId',        authenticate, updateEquipment);
router.delete('/equipment/:equipmentId',        authenticate, deleteEquipment);

module.exports = router;
