const express = require('express');
const router = express.Router();
const { getSites, createSite, getSite, updateSite, deleteSite, compareSites } = require('../controllers/site.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate, createSiteSchema } = require('../lib/validators/schemas');

router.get ('/',          authenticate, getSites);
router.post('/',          authenticate, validate(createSiteSchema), createSite);
router.get ('/compare',   authenticate, compareSites);
router.get ('/:siteId',   authenticate, getSite);
router.patch('/:siteId',  authenticate, updateSite);
router.delete('/:siteId', authenticate, deleteSite);

module.exports = router;
