const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contact.controller');
const { validate, contactSchema } = require('../lib/validators/schemas');

router.post('/', validate(contactSchema), submitContact);

module.exports = router;
