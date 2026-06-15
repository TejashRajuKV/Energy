const express = require('express');
const router = express.Router();
const { getBills, createBill, updateBill, deleteBill } = require('../controllers/bill.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate, createBillSchema } = require('../lib/validators/schemas');

router.get ('/:siteId/bills',        authenticate, getBills);
router.post('/:siteId/bills',        authenticate, validate(createBillSchema), createBill);
router.patch('/bills/:billId',        authenticate, updateBill);
router.delete('/bills/:billId',       authenticate, deleteBill);

module.exports = router;
