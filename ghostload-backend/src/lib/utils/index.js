const crypto = require('crypto');

/**
 * Generate a cryptographically secure random token
 */
const generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate a URL-friendly slug from a string
 */
const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Paginate a Prisma query result
 */
const paginate = (page = 1, limit = 20) => {
  const take = Math.min(parseInt(limit), 100);
  const skip = (Math.max(parseInt(page), 1) - 1) * take;
  return { take, skip };
};

/**
 * Format a Decimal (Prisma) to a plain JS number
 */
const toNumber = (decimal) => {
  if (decimal === null || decimal === undefined) return null;
  return parseFloat(decimal.toString());
};

/**
 * Calculate the number of hours between two HH:MM time strings
 */
const hoursBetween = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  let diff = endMinutes - startMinutes;
  if (diff < 0) diff += 24 * 60; // handle overnight
  return diff / 60;
};

/**
 * Convert kWh to CO2 kg using emission factor
 */
const kwhToCo2 = (kwh, factor = 0.82) => {
  return kwh * factor;
};

/**
 * Round to 2 decimal places
 */
const round2 = (num) => Math.round(num * 100) / 100;

/**
 * Clamp a value between min and max
 */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Return expiry date N hours from now
 */
const hoursFromNow = (hours) => {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

/**
 * Return expiry date N days from now
 */
const daysFromNow = (days) => {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

module.exports = {
  generateToken,
  slugify,
  paginate,
  toNumber,
  hoursBetween,
  kwhToCo2,
  round2,
  clamp,
  hoursFromNow,
  daysFromNow,
};
