const prisma = require('../lib/db/prisma');

// GET /api/sites?orgId=
const getSites = async (req, res) => {
  const { orgId } = req.query;
  if (!orgId) return res.status(400).json({ error: 'orgId query param required' });

  // Verify membership
  const membership = await prisma.orgMember.findFirst({
    where: { organizationId: orgId, userId: req.user.id },
  });
  if (!membership) return res.status(403).json({ error: 'Not a member of this organization' });

  const sites = await prisma.site.findMany({
    where: { organizationId: orgId },
    include: {
      schedule: true,
      _count: { select: { analyses: true, bills: true, equipment: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(sites);
};

// POST /api/sites
const createSite = async (req, res) => {
  const { organizationId, ...siteData } = req.body;

  const membership = await prisma.orgMember.findFirst({
    where: { organizationId, userId: req.user.id },
  });
  if (!membership || ['viewer'].includes(membership.role)) {
    return res.status(403).json({ error: 'Insufficient permissions to create a site' });
  }

  const site = await prisma.site.create({
    data: { organizationId, ...siteData },
  });
  res.status(201).json(site);
};

// GET /api/sites/:siteId
const getSite = async (req, res) => {
  const site = await prisma.site.findUnique({
    where: { id: req.params.siteId },
    include: {
      schedule: true,
      equipment: { orderBy: { category: 'asc' } },
      bills: { orderBy: { billingPeriodEnd: 'desc' }, take: 5 },
      analyses: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          recommendations: { orderBy: { priorityRank: 'asc' }, take: 3 },
        },
      },
    },
  });
  if (!site) return res.status(404).json({ error: 'Site not found' });

  // Verify org membership
  const membership = await prisma.orgMember.findFirst({
    where: { organizationId: site.organizationId, userId: req.user.id },
  });
  if (!membership) return res.status(403).json({ error: 'Not authorized to view this site' });

  res.json(site);
};

// PATCH /api/sites/:siteId
const updateSite = async (req, res) => {
  const site = await prisma.site.findUnique({ where: { id: req.params.siteId } });
  if (!site) return res.status(404).json({ error: 'Site not found' });

  const membership = await prisma.orgMember.findFirst({
    where: { organizationId: site.organizationId, userId: req.user.id },
  });
  if (!membership || membership.role === 'viewer') {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  const data = { ...req.body };
  if (data.occupantsMin === '') data.occupantsMin = null;
  else if (typeof data.occupantsMin === 'string') data.occupantsMin = parseInt(data.occupantsMin, 10);

  if (data.occupantsMax === '') data.occupantsMax = null;
  else if (typeof data.occupantsMax === 'string') data.occupantsMax = parseInt(data.occupantsMax, 10);

  const updated = await prisma.site.update({
    where: { id: req.params.siteId },
    data,
  });
  res.json(updated);
};

// DELETE /api/sites/:siteId
const deleteSite = async (req, res) => {
  const site = await prisma.site.findUnique({ where: { id: req.params.siteId } });
  if (!site) return res.status(404).json({ error: 'Site not found' });

  const membership = await prisma.orgMember.findFirst({
    where: { organizationId: site.organizationId, userId: req.user.id },
  });
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return res.status(403).json({ error: 'Insufficient permissions to delete a site' });
  }

  await prisma.site.delete({ where: { id: req.params.siteId } });
  res.json({ message: 'Site deleted successfully' });
};

// GET /api/sites/compare?orgId=
const compareSites = async (req, res) => {
  const { orgId } = req.query;
  if (!orgId) return res.status(400).json({ error: 'orgId query param required' });

  const membership = await prisma.orgMember.findFirst({
    where: { organizationId: orgId, userId: req.user.id },
  });
  if (!membership) return res.status(403).json({ error: 'Not a member of this organization' });

  const sites = await prisma.site.findMany({
    where: { organizationId: orgId },
    include: {
      analyses: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          breakdowns: { orderBy: { sharePercent: 'desc' }, take: 1 }
        }
      }
    }
  });

  const comparisonData = sites.map(site => {
    const latestAnalysis = site.analyses[0] || null;
    const topCategory = latestAnalysis?.breakdowns[0]?.category || null;

    return {
      id: site.id,
      name: site.name,
      city: site.city,
      floorAreaSqft: site.floorAreaSqft,
      hasAnalysis: !!latestAnalysis,
      estimatedMonthlyWaste: latestAnalysis ? Number(latestAnalysis.estimatedAfterHoursCost) : 0,
      afterHoursKwh: latestAnalysis ? Number(latestAnalysis.estimatedAfterHoursKwh) : 0,
      annualCo2Kg: latestAnalysis ? Number(latestAnalysis.annualCo2Kg) : 0,
      wasteRatio: latestAnalysis ? Number(latestAnalysis.estimatedWasteRatio) : 0,
      topWasteCategory: topCategory,
      analysisId: latestAnalysis?.id || null,
    };
  });

  comparisonData.sort((a, b) => b.estimatedMonthlyWaste - a.estimatedMonthlyWaste);
  res.json(comparisonData);
};

module.exports = { getSites, createSite, getSite, updateSite, deleteSite, compareSites };
