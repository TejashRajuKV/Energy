const prisma = require('../lib/db/prisma');

const getSchedule = async (req, res) => {
  const schedule = await prisma.siteSchedule.findUnique({ where: { siteId: req.params.siteId } });
  if (!schedule) return res.status(404).json({ error: 'Schedule not found. Please create one.' });
  res.json(schedule);
};

const upsertSchedule = async (req, res) => {
  const { siteId } = req.params;
  const schedule = await prisma.siteSchedule.upsert({
    where: { siteId },
    update: req.body,
    create: { siteId, ...req.body },
  });
  res.json(schedule);
};

module.exports = { getSchedule, upsertSchedule };
