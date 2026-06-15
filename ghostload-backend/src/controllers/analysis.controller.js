const prisma = require('../lib/db/prisma');
const ghostLoadEngine = require('../lib/modeling/engine');

// POST /api/analyses/:siteId/analyze
const runAnalysis = async (req, res) => {
  const { siteId } = req.params;
  const { billId } = req.body;

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: { schedule: true, equipment: true },
  });
  if (!site) return res.status(404).json({ error: 'Site not found' });

  const bill = await prisma.utilityBill.findFirst({
    where: { id: billId || undefined, siteId },
    orderBy: { billingPeriodEnd: 'desc' },
  });
  if (!bill) return res.status(400).json({ error: 'No utility bill found. Please add a bill first.' });

  // Run the estimation engine
  const result = ghostLoadEngine.analyze({ site, bill, schedule: site.schedule, equipment: site.equipment });

  // Persist analysis
  const analysis = await prisma.analysis.create({
    data: {
      siteId,
      utilityBillId: bill.id,
      totalEstimatedKwh: result.totalEstimatedKwh,
      estimatedAfterHoursKwh: result.estimatedAfterHoursKwh,
      estimatedAfterHoursCost: result.estimatedAfterHoursCost,
      estimatedWasteRatio: result.estimatedWasteRatio,
      annualCo2Kg: result.annualCo2Kg,
      confidenceScore: result.confidenceScore,
      assumptionsJson: result.assumptions,
      createdBy: req.user.id,
      breakdowns: {
        create: result.breakdowns,
      },
      recommendations: {
        create: result.recommendations,
      },
    },
    include: {
      breakdowns: true,
      recommendations: { orderBy: { priorityRank: 'asc' } },
    },
  });

  res.status(201).json(analysis);
};

// GET /api/analyses/:analysisId
const getAnalysis = async (req, res) => {
  const analysis = await prisma.analysis.findUnique({
    where: { id: req.params.analysisId },
    include: {
      breakdowns: true,
      recommendations: { orderBy: { priorityRank: 'asc' } },
      scenarios: { orderBy: { createdAt: 'desc' } },
      site: { select: { id: true, name: true, organizationId: true, city: true, floorAreaSqft: true } },
      bill: true,
    },
  });
  if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
  res.json(analysis);
};

// GET /api/analyses/:analysisId/breakdown
const getBreakdown = async (req, res) => {
  const breakdowns = await prisma.analysisBreakdown.findMany({
    where: { analysisId: req.params.analysisId },
    orderBy: { sharePercent: 'desc' },
  });
  res.json(breakdowns);
};

// GET /api/analyses/:analysisId/recommendations
const getRecommendations = async (req, res) => {
  const recommendations = await prisma.recommendation.findMany({
    where: { analysisId: req.params.analysisId },
    orderBy: { priorityRank: 'asc' },
  });
  res.json(recommendations);
};

module.exports = { runAnalysis, getAnalysis, getBreakdown, getRecommendations };
