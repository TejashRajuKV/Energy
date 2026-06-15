const { verifyAccessToken } = require('../lib/auth/jwt');
const prisma = require('../lib/db/prisma');

/**
 * Authenticate request — require valid JWT
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerifiedAt: true,
        preferredCurrency: true,
        timezone: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Require a minimum role within the request's target organization
 * Usage: requireRole('admin') or requireRole(['admin', 'owner'])
 */
const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return async (req, res, next) => {
    try {
      const orgId = req.params.orgId || req.body.organizationId || req.query.orgId;
      if (!orgId) return res.status(400).json({ error: 'Organization context required' });

      const membership = await prisma.orgMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId: req.user.id,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({ error: 'You are not a member of this organization' });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({ error: `Role '${membership.role}' is not authorized for this action` });
      }

      req.membership = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Require org membership (any role) — attach membership to req
 */
const requireOrgMember = async (req, res, next) => {
  try {
    const orgId = req.params.orgId || req.body.organizationId || req.query.orgId;
    if (!orgId) return res.status(400).json({ error: 'Organization context required' });

    const membership = await prisma.orgMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: req.user.id,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this organization' });
    }

    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate, requireRole, requireOrgMember };
