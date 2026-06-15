const prisma = require('../lib/db/prisma');
const ghostLoadEngine = require('../lib/modeling/engine');

const createScenario = async (req, res) => {
  const { analysisId } = req.params;
  const { name, changesJson } = req.body;

  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: { site: { include: { schedule: true, equipment: true } }, bill: true },
  });
  if (!analysis) return res.status(404).json({ error: 'Analysis not found' });

  // Compute projected savings based on scenario changes
  const projection = ghostLoadEngine.simulateScenario(analysis, changesJson);

  const scenario = await prisma.scenario.create({
    data: {
      analysisId,
      name,
      changesJson,
      projectedMonthlySavings: projection.projectedMonthlySavings,
      projectedAnnualCo2Kg: projection.projectedAnnualCo2Kg,
      projectedWasteRatio: projection.projectedWasteRatio,
      createdBy: req.user.id,
    },
  });
  res.status(201).json(scenario);
};

const getScenarios = async (req, res) => {
  const scenarios = await prisma.scenario.findMany({
    where: { analysisId: req.params.analysisId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(scenarios);
};

const getScenario = async (req, res) => {
  const scenario = await prisma.scenario.findUnique({ where: { id: req.params.scenarioId } });
  if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
  res.json(scenario);
};

const deleteScenario = async (req, res) => {
  await prisma.scenario.delete({ where: { id: req.params.scenarioId } });
  res.json({ message: 'Scenario deleted' });
};

module.exports = { createScenario, getScenarios, getScenario, deleteScenario };
