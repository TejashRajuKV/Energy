/**
 * GhostLoad — Constants
 * Central source of truth for product-level constants and default assumptions
 */

// ─────────────────────────────────────────────────────────
// EMISSION FACTORS
// ─────────────────────────────────────────────────────────
const EMISSION_FACTOR_KG_PER_KWH = parseFloat(process.env.EMISSION_FACTOR_KG_PER_KWH || '0.82');

// ─────────────────────────────────────────────────────────
// EQUIPMENT DEFAULT WATTAGES (in Watts)
// Industry-standard typical values for Indian offices
// ─────────────────────────────────────────────────────────
const EQUIPMENT_DEFAULTS = {
  // HVAC
  split_ac_1_5ton:   { ratedWatts: 1500, standbyWatts: 5  },
  split_ac_2ton:     { ratedWatts: 2000, standbyWatts: 5  },
  central_ac_unit:   { ratedWatts: 5000, standbyWatts: 20 },

  // Compute
  desktop_pc:        { ratedWatts: 150,  standbyWatts: 5  },
  laptop:            { ratedWatts: 65,   standbyWatts: 3  },
  monitor_24in:      { ratedWatts: 30,   standbyWatts: 2  },
  monitor_27in:      { ratedWatts: 45,   standbyWatts: 2  },
  printer_laser:     { ratedWatts: 400,  standbyWatts: 8  },
  printer_inkjet:    { ratedWatts: 40,   standbyWatts: 3  },

  // Network / Server
  router_wifi:       { ratedWatts: 15,   standbyWatts: 15 }, // always_on
  network_switch:    { ratedWatts: 30,   standbyWatts: 30 }, // always_on
  server_rack:       { ratedWatts: 500,  standbyWatts: 500 }, // always_on
  ups_unit:          { ratedWatts: 200,  standbyWatts: 50 },

  // Kitchen
  microwave:         { ratedWatts: 1000, standbyWatts: 3  },
  refrigerator:      { ratedWatts: 200,  standbyWatts: 200 }, // always_on cycling
  coffee_machine:    { ratedWatts: 1200, standbyWatts: 5  },
  water_dispenser:   { ratedWatts: 500,  standbyWatts: 100 },
  electric_kettle:   { ratedWatts: 1500, standbyWatts: 0  },

  // Lighting
  led_tube_18w:      { ratedWatts: 18,   standbyWatts: 0  },
  led_panel_40w:     { ratedWatts: 40,   standbyWatts: 0  },
  cfl_lamp:          { ratedWatts: 23,   standbyWatts: 0  },
  halogen_spotlight: { ratedWatts: 50,   standbyWatts: 0  },
};

// ─────────────────────────────────────────────────────────
// OFFICE AREA BENCHMARKS (kWh per sqft per month)
// For baseline estimation when minimal data is provided
// ─────────────────────────────────────────────────────────
const AREA_BENCHMARKS = {
  office:    { low: 0.6, mid: 1.0, high: 1.5 },
  coworking: { low: 0.5, mid: 0.9, high: 1.3 },
  clinic:    { low: 0.8, mid: 1.2, high: 1.8 },
  studio:    { low: 0.4, mid: 0.7, high: 1.1 },
  school:    { low: 0.3, mid: 0.6, high: 1.0 },
  other:     { low: 0.5, mid: 0.9, high: 1.4 },
};

// ─────────────────────────────────────────────────────────
// TYPICAL OFF-HOURS WASTE RATIOS BY CATEGORY
// What percentage of a category's usage happens after-hours
// ─────────────────────────────────────────────────────────
const AFTER_HOURS_RATIOS = {
  hvac:     { low: 0.05, typical: 0.15, high: 0.30 }, // HVAC overshoot
  lighting: { low: 0.02, typical: 0.08, high: 0.20 }, // lights left on
  compute:  { low: 0.05, typical: 0.12, high: 0.25 }, // standby + sleep fails
  network:  { low: 0.80, typical: 0.90, high: 1.00 }, // routers/switches always on
  kitchen:  { low: 0.10, typical: 0.20, high: 0.35 }, // fridges + standby
  misc:     { low: 0.05, typical: 0.10, high: 0.20 },
};

// ─────────────────────────────────────────────────────────
// HVAC AFTER-HOURS MULTIPLIERS
// Adjustment based on HVAC type and always-on nature
// ─────────────────────────────────────────────────────────
const HVAC_MULTIPLIERS = {
  central_ac: 1.4,
  split_ac:   1.1,
  vrf:        1.2,
  chiller:    1.5,
  none:       0.0,
  other:      1.1,
};

// ─────────────────────────────────────────────────────────
// WEEKEND USAGE MULTIPLIERS
// How much extra load is added on weekends vs weekdays
// ─────────────────────────────────────────────────────────
const WEEKEND_MULTIPLIERS = {
  none:   0.05, // minimal: security/servers only
  low:    0.20,
  medium: 0.50,
  high:   0.85,
};

// ─────────────────────────────────────────────────────────
// CONFIDENCE SCORE WEIGHTS
// Each data point that is provided increases confidence
// ─────────────────────────────────────────────────────────
const CONFIDENCE_WEIGHTS = {
  kwh_provided:        0.20,
  tariff_known:        0.10,
  schedule_complete:   0.15,
  equipment_complete:  0.20,
  area_provided:       0.10,
  occupancy_provided:  0.10,
  hvac_type_known:     0.10,
  city_provided:       0.05,
};

const CONFIDENCE_BASE = 0.30; // minimum confidence with bill amount only

// ─────────────────────────────────────────────────────────
// DEFAULT TARIFF RATE (INR per kWh)
// Used when tariff is unknown
// ─────────────────────────────────────────────────────────
const DEFAULT_UNIT_RATE_INR = 8.5;

// ─────────────────────────────────────────────────────────
// RBAC ROLE HIERARCHY
// ─────────────────────────────────────────────────────────
const ROLES = {
  owner:   ['owner', 'admin', 'analyst', 'viewer'],
  admin:   ['admin', 'analyst', 'viewer'],
  analyst: ['analyst', 'viewer'],
  viewer:  ['viewer'],
};

const ROLE_CAN_WRITE = ['owner', 'admin', 'analyst'];
const ROLE_CAN_MANAGE = ['owner', 'admin'];
const ROLE_OWNER_ONLY = ['owner'];

module.exports = {
  EMISSION_FACTOR_KG_PER_KWH,
  EQUIPMENT_DEFAULTS,
  AREA_BENCHMARKS,
  AFTER_HOURS_RATIOS,
  HVAC_MULTIPLIERS,
  WEEKEND_MULTIPLIERS,
  CONFIDENCE_WEIGHTS,
  CONFIDENCE_BASE,
  DEFAULT_UNIT_RATE_INR,
  ROLES,
  ROLE_CAN_WRITE,
  ROLE_CAN_MANAGE,
  ROLE_OWNER_ONLY,
};
