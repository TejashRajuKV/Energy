const prisma = require('../lib/db/prisma');

const getBills = async (req, res) => {
  const bills = await prisma.utilityBill.findMany({
    where: { siteId: req.params.siteId },
    orderBy: { billingPeriodEnd: 'desc' },
  });
  res.json(bills);
};

const createBill = async (req, res) => {
  const data = { ...req.body, siteId: req.params.siteId };
  if (data.billingPeriodStart) data.billingPeriodStart = new Date(data.billingPeriodStart).toISOString();
  if (data.billingPeriodEnd) data.billingPeriodEnd = new Date(data.billingPeriodEnd).toISOString();

  const bill = await prisma.utilityBill.create({ data });
  res.status(201).json(bill);
};

const updateBill = async (req, res) => {
  const data = { ...req.body };
  if (data.billingPeriodStart) data.billingPeriodStart = new Date(data.billingPeriodStart).toISOString();
  if (data.billingPeriodEnd) data.billingPeriodEnd = new Date(data.billingPeriodEnd).toISOString();

  const bill = await prisma.utilityBill.update({
    where: { id: req.params.billId },
    data,
  });
  res.json(bill);
};

const deleteBill = async (req, res) => {
  await prisma.utilityBill.delete({ where: { id: req.params.billId } });
  res.json({ message: 'Bill deleted' });
};

module.exports = { getBills, createBill, updateBill, deleteBill };
