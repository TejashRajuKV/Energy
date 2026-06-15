const bcrypt = require('bcryptjs');
const prisma = require('../lib/db/prisma');

const getProfile = async (req, res) => {
  res.json(req.user);
};

const updateProfile = async (req, res) => {
  const { name, preferredCurrency, timezone, avatarUrl } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, preferredCurrency, timezone, avatarUrl },
    select: { id: true, name: true, email: true, preferredCurrency: true, timezone: true, avatarUrl: true },
  });
  res.json(updated);
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!user.passwordHash) {
    return res.status(400).json({ error: 'Password change not available for OAuth accounts' });
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash: hash } });
  res.json({ message: 'Password changed successfully' });
};

module.exports = { getProfile, updateProfile, changePassword };
