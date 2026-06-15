const prisma = require('../lib/db/prisma');

const getEquipment = async (req, res) => {
  const equipment = await prisma.equipmentProfile.findMany({
    where: { siteId: req.params.siteId },
    orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
  });
  res.json(equipment);
};

const createEquipment = async (req, res) => {
  const item = await prisma.equipmentProfile.create({
    data: { siteId: req.params.siteId, ...req.body },
  });
  res.status(201).json(item);
};

const updateEquipment = async (req, res) => {
  const item = await prisma.equipmentProfile.update({
    where: { id: req.params.equipmentId },
    data: req.body,
  });
  res.json(item);
};

const deleteEquipment = async (req, res) => {
  await prisma.equipmentProfile.delete({ where: { id: req.params.equipmentId } });
  res.json({ message: 'Equipment item deleted' });
};

module.exports = { getEquipment, createEquipment, updateEquipment, deleteEquipment };
