const prisma = require('../lib/db/prisma');
const { generateToken } = require('../lib/utils');

const exportPdf = async (req, res) => {
  const { analysisId } = req.params;
  const report = await prisma.report.create({
    data: {
      analysisId,
      reportType: 'pdf',
      fileUrl: null, // TODO: generate actual PDF in Phase 2
      createdBy: req.user.id,
    },
  });
  res.status(201).json({ message: 'PDF export queued', report });
};

const exportCsv = async (req, res) => {
  const { analysisId } = req.params;
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: { recommendations: { orderBy: { priorityRank: 'asc' } } },
  });
  if (!analysis) return res.status(404).json({ error: 'Analysis not found' });

  // Build CSV string
  const header = 'Rank,Category,Title,Monthly Savings (INR),Annual CO2 (kg),Payback (months),Effort,Confidence';
  const rows = analysis.recommendations.map((r) =>
    [r.priorityRank, r.category, `"${r.title}"`, r.estimatedMonthlySavings, r.estimatedAnnualCo2Kg, r.paybackMonths || '', r.effortLevel, r.confidenceScore].join(',')
  );
  const csv = [header, ...rows].join('\n');

  const report = await prisma.report.create({
    data: {
      analysisId,
      reportType: 'csv',
      createdBy: req.user.id,
    },
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="ghostload-report-${analysisId}.csv"`);
  res.send(csv);
};

const getReport = async (req, res) => {
  const report = await prisma.report.findUnique({ where: { id: req.params.reportId } });
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json(report);
};

const getByShareToken = async (req, res) => {
  const report = await prisma.report.findUnique({
    where: { shareToken: req.params.shareToken },
    include: {
      analysis: {
        include: {
          breakdowns: true,
          recommendations: { orderBy: { priorityRank: 'asc' } },
          site: { select: { name: true, city: true, siteType: true } },
          bill: true,
        },
      },
    },
  });
  if (!report) return res.status(404).json({ error: 'Report not found or link expired' });
  res.json(report);
};

const exportShare = async (req, res) => {
  const { analysisId } = req.params;
  const analysis = await prisma.analysis.findUnique({ where: { id: analysisId } });
  if (!analysis) return res.status(404).json({ error: 'Analysis not found' });

  let report = await prisma.report.findFirst({
    where: { analysisId, reportType: 'share' },
  });

  if (!report) {
    report = await prisma.report.create({
      data: {
        analysisId,
        reportType: 'share',
        shareToken: generateToken(32),
        createdBy: req.user.id,
      },
    });
  }

  res.json({ shareToken: report.shareToken });
};

module.exports = { exportPdf, exportCsv, exportShare, getReport, getByShareToken };
