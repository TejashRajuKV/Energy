const prisma = require('../lib/db/prisma');
const { slugify, generateToken, daysFromNow } = require('../lib/utils');
const { sendInviteEmail } = require('../services/email.service');

// POST /api/orgs
const createOrg = async (req, res) => {
  const { name, industry, companySize } = req.body;
  const slug = slugify(name) + '-' + Date.now().toString(36);

  const org = await prisma.organization.create({
    data: {
      name,
      slug,
      industry,
      companySize,
      createdBy: req.user.id,
      members: {
        create: {
          userId: req.user.id,
          role: 'owner',
          joinedAt: new Date(),
        },
      },
    },
    include: { members: true },
  });

  res.status(201).json(org);
};

// GET /api/orgs/:orgId
const getOrg = async (req, res) => {
  const org = await prisma.organization.findUnique({
    where: { id: req.params.orgId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
      },
      _count: { select: { sites: true } },
    },
  });

  if (!org) return res.status(404).json({ error: 'Organization not found' });
  res.json(org);
};

// PATCH /api/orgs/:orgId
const updateOrg = async (req, res) => {
  const { name, industry, companySize, billingEmail } = req.body;
  const org = await prisma.organization.update({
    where: { id: req.params.orgId },
    data: { name, industry, companySize, billingEmail },
  });
  res.json(org);
};

// POST /api/orgs/:orgId/invite
const inviteMember = async (req, res) => {
  const { email, role } = req.body;
  const { orgId } = req.params;

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  // Check if already a member
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMembership = await prisma.orgMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: existingUser.id } },
    });
    if (existingMembership) {
      return res.status(409).json({ error: 'User is already a member of this organization' });
    }

    // Add directly
    await prisma.orgMember.create({
      data: {
        organizationId: orgId,
        userId: existingUser.id,
        role,
        invitedBy: req.user.id,
        joinedAt: new Date(),
      },
    });
    return res.status(201).json({ message: 'Member added successfully' });
  }

  // Send invite email (external user)
  const token = generateToken();
  sendInviteEmail(email, req.user.name, org.name, token).catch(console.error);
  res.status(200).json({ message: 'Invitation sent to ' + email });
};

// PATCH /api/orgs/:orgId/members/:memberId
const updateMemberRole = async (req, res) => {
  const { role } = req.body;
  const { orgId, memberId } = req.params;

  // Prevent changing your own role
  const target = await prisma.orgMember.findFirst({
    where: { id: memberId, organizationId: orgId },
  });
  if (!target) return res.status(404).json({ error: 'Member not found' });
  if (target.userId === req.user.id) {
    return res.status(400).json({ error: 'You cannot change your own role' });
  }
  if (target.role === 'owner') {
    return res.status(400).json({ error: 'Cannot change owner role' });
  }

  const updated = await prisma.orgMember.update({
    where: { id: memberId },
    data: { role },
  });
  res.json(updated);
};

// DELETE /api/orgs/:orgId/members/:memberId
const removeMember = async (req, res) => {
  const { orgId, memberId } = req.params;
  const target = await prisma.orgMember.findFirst({
    where: { id: memberId, organizationId: orgId },
  });
  if (!target) return res.status(404).json({ error: 'Member not found' });
  if (target.role === 'owner') {
    return res.status(400).json({ error: 'Cannot remove the organization owner' });
  }
  await prisma.orgMember.delete({ where: { id: memberId } });
  res.json({ message: 'Member removed successfully' });
};

// GET /api/orgs/:orgId/analytics
const getOrgAnalytics = async (req, res) => {
  const { orgId } = req.params;

  const sites = await prisma.site.findMany({
    where: { organizationId: orgId },
    select: {
      id: true,
      analyses: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          breakdowns: true,
          recommendations: { orderBy: { priorityRank: 'asc' }, take: 3 },
        }
      }
    }
  });

  let totalMonthlyWaste = 0;
  let totalSavingsOpp = 0;
  let totalCo2 = 0;
  const categorySums = {};

  sites.forEach(site => {
    if (site.analyses && site.analyses.length > 0) {
      const analysis = site.analyses[0];
      totalMonthlyWaste += Number(analysis.estimatedAfterHoursCost || 0);
      totalCo2 += Number(analysis.annualCo2Kg || 0);
      
      // Sum top 3 recommendations savings * 12 for annual
      analysis.recommendations.forEach(rec => {
        totalSavingsOpp += Number(rec.estimatedMonthlySavings || 0) * 12;
      });

      // Aggregate breakdowns
      analysis.breakdowns.forEach(b => {
        const cat = b.category;
        categorySums[cat] = (categorySums[cat] || 0) + Number(b.estimatedCost || 0);
      });
    }
  });

  const totalCostForCategories = Object.values(categorySums).reduce((a, b) => a + b, 0);
  const breakdowns = Object.entries(categorySums).map(([name, cost]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: totalCostForCategories > 0 ? Math.round((cost / totalCostForCategories) * 100) : 0
  })).sort((a, b) => b.value - a.value);

  // Generate a mock 6-month trend flatlined at current waste (until historical data exists)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const trend = months.map(m => ({
    month: m,
    waste: totalMonthlyWaste
  }));

  res.json({
    totalMonthlyWaste,
    totalSavingsOpp,
    totalCo2,
    sitesAnalyzed: sites.filter(s => s.analyses.length > 0).length,
    breakdowns,
    trend
  });
};

module.exports = { createOrg, getOrg, updateOrg, inviteMember, updateMemberRole, removeMember, getOrgAnalytics };
