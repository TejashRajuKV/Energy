const { z } = require('zod');

// ─────────────────────────────────────────────────────────
// AUTH VALIDATORS
// ─────────────────────────────────────────────────────────

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
});

// ─────────────────────────────────────────────────────────
// ORGANIZATION VALIDATORS
// ─────────────────────────────────────────────────────────

const createOrgSchema = z.object({
  name: z.string().min(2).max(150),
  industry: z.string().max(80).optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'analyst', 'viewer']),
});

// ─────────────────────────────────────────────────────────
// SITE VALIDATORS
// ─────────────────────────────────────────────────────────

const createSiteSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(2).max(150),
  siteType: z.enum(['office', 'coworking', 'clinic', 'studio', 'school', 'other']).default('office'),
  city: z.string().min(1).max(100),
  country: z.string().max(100).default('India'),
  timezone: z.string().default('Asia/Kolkata'),
  floorAreaSqft: z.number().int().positive().max(1000000),
  occupantsMin: z.number().int().positive().optional(),
  occupantsMax: z.number().int().positive().optional(),
  hvacType: z.enum(['central_ac', 'split_ac', 'vrf', 'chiller', 'none', 'other']).optional(),
  hasServerRoom: z.boolean().default(false),
  weekendUsage: z.enum(['none', 'low', 'medium', 'high']).default('none'),
});

// ─────────────────────────────────────────────────────────
// SCHEDULE VALIDATORS
// ─────────────────────────────────────────────────────────

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$|^$/;
const scheduleSchema = z.object({
  weekdayOpenTime: z.string().regex(timeRegex, 'Must be HH:MM format'),
  weekdayCloseTime: z.string().regex(timeRegex, 'Must be HH:MM format'),
  saturdayOpenTime: z.string().regex(timeRegex).optional().nullable(),
  saturdayCloseTime: z.string().regex(timeRegex).optional().nullable(),
  sundayOpenTime: z.string().regex(timeRegex).optional().nullable(),
  sundayCloseTime: z.string().regex(timeRegex).optional().nullable(),
  cleaningStartTime: z.string().regex(timeRegex).optional().nullable(),
  cleaningEndTime: z.string().regex(timeRegex).optional().nullable(),
  securityAlwaysOn: z.boolean().default(true),
  hvacPrecoolMins: z.number().int().min(0).max(120).default(30),
  hvacPostcoolMins: z.number().int().min(0).max(120).default(30),
});

// ─────────────────────────────────────────────────────────
// BILL VALIDATORS
// ─────────────────────────────────────────────────────────

const createBillSchema = z.object({
  billingPeriodStart: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  billingPeriodEnd: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  billAmount: z.number().positive(),
  currency: z.string().length(3).default('INR'),
  kwhTotal: z.number().positive().optional(),
  tariffType: z.enum(['flat', 'tou', 'estimated']).default('flat'),
  unitRate: z.number().positive().optional(),
  peakRate: z.number().positive().optional(),
  offpeakRate: z.number().positive().optional(),
});

// ─────────────────────────────────────────────────────────
// EQUIPMENT VALIDATORS
// ─────────────────────────────────────────────────────────

const createEquipmentSchema = z.object({
  category: z.enum(['hvac', 'lighting', 'compute', 'network', 'kitchen', 'misc']),
  itemName: z.string().min(1).max(120),
  quantity: z.number().int().positive().max(10000),
  ratedWatts: z.number().int().positive().max(100000).optional(),
  activeHoursPerDay: z.number().min(0).max(24).optional(),
  standbyHoursPerDay: z.number().min(0).max(24).optional(),
  standbyWatts: z.number().int().min(0).max(10000).optional(),
  usagePattern: z.enum(['scheduled', 'intermittent', 'always_on']).default('scheduled'),
});

// ─────────────────────────────────────────────────────────
// SCENARIO VALIDATORS
// ─────────────────────────────────────────────────────────

const createScenarioSchema = z.object({
  name: z.string().min(1).max(120),
  changesJson: z.object({
    hvacRuntimeReductionPercent: z.number().min(0).max(100).optional(),
    weekendShutdown: z.boolean().optional(),
    smartStripAdoption: z.boolean().optional(),
    printerStandbyElimination: z.boolean().optional(),
    lightingAutomation: z.boolean().optional(),
    deviceShutdownPolicy: z.boolean().optional(),
  }),
});

// ─────────────────────────────────────────────────────────
// CONTACT VALIDATOR
// ─────────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  company: z.string().min(1).max(150).optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  message: z.string().min(10).max(2000),
  interest: z.enum(['demo', 'pilot', 'support', 'other']).optional(),
});

/**
 * Middleware factory: validate req.body against a Zod schema
 */
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    next(err); // handled by global error handler
  }
};

module.exports = {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createOrgSchema,
  inviteMemberSchema,
  createSiteSchema,
  scheduleSchema,
  createBillSchema,
  createEquipmentSchema,
  createScenarioSchema,
  contactSchema,
  validate,
};
