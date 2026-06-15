const express = require('express');
const router = express.Router();
const { createOrg, getOrg, updateOrg, inviteMember, updateMemberRole, removeMember, getOrgAnalytics } = require('../controllers/org.controller');
const { authenticate, requireRole, requireOrgMember } = require('../middleware/auth.middleware');
const { validate, createOrgSchema, inviteMemberSchema } = require('../lib/validators/schemas');

router.post('/',                                          authenticate,                          validate(createOrgSchema), createOrg);
router.get ('/:orgId',                                    authenticate, requireOrgMember,         getOrg);
router.get ('/:orgId/analytics',                          authenticate, requireOrgMember,         getOrgAnalytics);
router.patch('/:orgId',                                   authenticate, requireRole(['owner','admin']), updateOrg);
router.post ('/:orgId/invite',                            authenticate, requireRole(['owner','admin']), validate(inviteMemberSchema), inviteMember);
router.patch('/:orgId/members/:memberId',                 authenticate, requireRole(['owner','admin']), updateMemberRole);
router.delete('/:orgId/members/:memberId',                authenticate, requireRole(['owner','admin']), removeMember);

module.exports = router;
