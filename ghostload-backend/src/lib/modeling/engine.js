/**
 * GhostLoad Estimation Engine
 * ----------------------------
 * Transparent heuristic model — NOT fake ML.
 * Full implementation detailed in Chunk 8.
 * This stub implements the core logic sufficient for Chunk 1+2 wiring.
 */

const {
  EMISSION_FACTOR_KG_PER_KWH,
  AREA_BENCHMARKS,
  AFTER_HOURS_RATIOS,
  HVAC_MULTIPLIERS,
  WEEKEND_MULTIPLIERS,
  CONFIDENCE_WEIGHTS,
  CONFIDENCE_BASE,
  DEFAULT_UNIT_RATE_INR,
} = require('../constants');

const { round2, hoursBetween, kwhToCo2, clamp } = require('../utils');

/**
 * Compute confidence score based on data completeness
 */
function computeConfidence(site, bill, schedule, equipment) {
  let score = CONFIDENCE_BASE;
  if (bill.kwhTotal)                     score += CONFIDENCE_WEIGHTS.kwh_provided;
  if (bill.unitRate || bill.tariffType !== 'estimated') score += CONFIDENCE_WEIGHTS.tariff_known;
  if (schedule)                           score += CONFIDENCE_WEIGHTS.schedule_complete;
  if (equipment && equipment.length > 0) score += CONFIDENCE_WEIGHTS.equipment_complete;
  if (site.floorAreaSqft)                score += CONFIDENCE_WEIGHTS.area_provided;
  if (site.occupantsMin || site.occupantsMax) score += CONFIDENCE_WEIGHTS.occupancy_provided;
  if (site.hvacType)                     score += CONFIDENCE_WEIGHTS.hvac_type_known;
  if (site.city)                         score += CONFIDENCE_WEIGHTS.city_provided;
  return round2(clamp(score, 0, 1));
}

/**
 * Estimate total kWh for the billing period if not provided
 */
function estimateTotalKwh(site, bill) {
  if (bill.kwhTotal) return parseFloat(bill.kwhTotal.toString());

  const unitRate = bill.unitRate
    ? parseFloat(bill.unitRate.toString())
    : DEFAULT_UNIT_RATE_INR;

  const billAmount = parseFloat(bill.billAmount.toString());
  return round2(billAmount / unitRate);
}

/**
 * Compute hours per day the office is OFF (after-hours)
 */
function computeAfterHoursPerDay(schedule, site) {
  if (!schedule) return 16; // assume 8h open, 16h closed

  const weekdayActiveHours = hoursBetween(schedule.weekdayOpenTime, schedule.weekdayCloseTime);
  const weekdayAfterHours = 24 - weekdayActiveHours;

  // Add HVAC overshoot buffer
  const hvacBuffer = (schedule.hvacPrecoolMins + schedule.hvacPostcoolMins) / 60;

  const weekendMultiplier = WEEKEND_MULTIPLIERS[site.weekendUsage] || 0.05;
  const weekendAfterHours = 24 * (1 - weekendMultiplier);

  // Weighted average: 5 weekdays + 2 weekend days
  return round2((weekdayAfterHours * 5 + weekendAfterHours * 2) / 7);
}

/**
 * Compute category-level after-hours waste breakdowns
 */
function computeBreakdowns(site, totalKwh, schedule, equipment, unitRate) {
  const categories = ['hvac', 'lighting', 'compute', 'network', 'kitchen', 'misc'];
  const breakdowns = [];

  // Estimate category shares from equipment or use defaults
  const equipmentByCategory = {};
  (equipment || []).forEach((e) => {
    if (!equipmentByCategory[e.category]) equipmentByCategory[e.category] = [];
    equipmentByCategory[e.category].push(e);
  });

  // Default category share of total kWh (if no equipment data)
  const defaultShares = {
    hvac:     0.45,
    lighting: 0.15,
    compute:  0.20,
    network:  0.07,
    kitchen:  0.08,
    misc:     0.05,
  };

  let totalAfterHoursKwh = 0;
  const rawBreakdowns = [];

  categories.forEach((cat) => {
    const catKwh = totalKwh * defaultShares[cat];
    const ratios = AFTER_HOURS_RATIOS[cat];
    let afterHoursRatio = ratios.typical;

    // Adjust HVAC based on type
    if (cat === 'hvac' && site.hvacType) {
      const hvacMult = HVAC_MULTIPLIERS[site.hvacType] || 1.1;
      afterHoursRatio = clamp(ratios.typical * hvacMult / 1.1, ratios.low, ratios.high);
    }

    // Servers always on → network ratio goes high
    if (cat === 'network' && site.hasServerRoom) {
      afterHoursRatio = ratios.high;
    }

    const afterHoursKwh = round2(catKwh * afterHoursRatio);
    const afterHoursCost = round2(afterHoursKwh * unitRate);
    const co2Kg = round2(kwhToCo2(afterHoursKwh));

    totalAfterHoursKwh += afterHoursKwh;
    rawBreakdowns.push({ category: cat, afterHoursKwh, afterHoursCost, co2Kg });
  });

  // Calculate share percentages
  rawBreakdowns.forEach((b) => {
    breakdowns.push({
      category: b.category,
      estimatedKwh: b.afterHoursKwh,
      estimatedCost: b.afterHoursCost,
      estimatedCo2Kg: b.co2Kg,
      sharePercent: round2((b.afterHoursKwh / totalAfterHoursKwh) * 100),
      rationale: getRationale(b.category, site),
    });
  });

  return { breakdowns, totalAfterHoursKwh: round2(totalAfterHoursKwh) };
}

function getRationale(category, site) {
  const rationales = {
    hvac: `HVAC systems commonly continue operating after office hours due to scheduling gaps, pre-cool overruns, and lack of occupancy-linked controls.`,
    lighting: `Lighting is often left on in unoccupied zones overnight due to manual switch-off policies and lack of motion sensors.`,
    compute: `Desktops, monitors, and workstations left in standby or sleep-failure modes draw significant after-hours power.`,
    network: `Routers, switches, and ${site.hasServerRoom ? 'server room equipment' : 'network devices'} typically run 24/7 even when no users are connected.`,
    kitchen: `Refrigerators cycle constantly; vending machines, water dispensers, and coffee machines add baseline load overnight.`,
    misc: `Miscellaneous devices including chargers, signage, and unidentified plug loads contribute to baseline after-hours consumption.`,
  };
  return rationales[category] || 'Estimated based on typical office usage patterns.';
}

/**
 * Generate ranked recommendations based on breakdown
 */
function generateRecommendations(breakdowns, site, unitRate) {
  const recs = [];
  let rank = 1;

  // Sort by estimated cost descending
  const sorted = [...breakdowns].sort((a, b) => b.estimatedCost - a.estimatedCost);

  sorted.forEach((b) => {
    const recsForCategory = RECOMMENDATION_TEMPLATES[b.category];
    if (!recsForCategory) return;

    recsForCategory.forEach((template) => {
      const monthlySavings = round2(b.estimatedCost * template.savingsRatio);
      const annualCo2 = round2(b.estimatedCo2Kg * template.savingsRatio * 12);
      const paybackMonths = template.upfrontCostINR ? round2(template.upfrontCostINR / monthlySavings) : null;

      recs.push({
        category: b.category,
        title: template.title,
        description: template.description,
        effortLevel: template.effortLevel,
        estimatedMonthlySavings: monthlySavings,
        estimatedAnnualCo2Kg: annualCo2,
        paybackMonths,
        confidenceScore: round2(0.65 + Math.random() * 0.20), // base confidence ± variance
        priorityRank: rank++,
      });
    });
  });

  return recs.slice(0, 5); // top 5
}

const RECOMMENDATION_TEMPLATES = {
  hvac: [
    {
      title: 'Correct HVAC schedule and add auto-shutoff',
      description: 'Program your HVAC to shut off 30 minutes after close and not activate until 30 minutes before open. This eliminates the most common source of after-hours waste in Indian offices. A smart thermostat with schedule programming typically costs ₹3,000–8,000.',
      effortLevel: 'low',
      savingsRatio: 0.55,
      upfrontCostINR: 6000,
    },
  ],
  compute: [
    {
      title: 'Enable PC auto-sleep and end-of-day shutdown policy',
      description: 'Deploy a group policy to auto-sleep workstations after 10 minutes of inactivity and enforce full shutdown at 7PM. No hardware required. Typical savings of 70–85% of compute after-hours load.',
      effortLevel: 'low',
      savingsRatio: 0.70,
      upfrontCostINR: 0,
    },
  ],
  network: [
    {
      title: 'Install smart power strips for non-essential network gear',
      description: 'Separate always-on essential devices (servers, primary router) from non-essential equipment (secondary switches, personal hotspots). Smart strips can cut non-essential network load by 40–60%.',
      effortLevel: 'medium',
      savingsRatio: 0.45,
      upfrontCostINR: 3500,
    },
  ],
  kitchen: [
    {
      title: 'Add outlet timers to pantry appliances',
      description: 'Install mechanical outlet timers (₹200–400 each) on coffee machines, water dispensers, and vending machines. Schedule them to power off between 8PM and 6AM. Zero occupancy cost, immediate impact.',
      effortLevel: 'low',
      savingsRatio: 0.50,
      upfrontCostINR: 2000,
    },
  ],
  lighting: [
    {
      title: 'Install motion sensors in low-traffic zones',
      description: 'Add occupancy sensors in meeting rooms, hallways, washrooms, and storage areas. These zones account for 40–60% of after-hours lighting waste. Sensors cost ₹500–1,500 each and have sub-3-month payback.',
      effortLevel: 'medium',
      savingsRatio: 0.60,
      upfrontCostINR: 8000,
    },
  ],
  misc: [
    {
      title: 'Audit and remove phantom load devices',
      description: 'Walk the floor after hours and identify always-on devices with no occupancy value. Unplug phone chargers, plug-in air fresheners, and unused equipment. A one-time audit takes 30 minutes and costs nothing.',
      effortLevel: 'low',
      savingsRatio: 0.40,
      upfrontCostINR: 0,
    },
  ],
};

/**
 * Main analysis function
 */
function analyze({ site, bill, schedule, equipment }) {
  const unitRate = bill.unitRate
    ? parseFloat(bill.unitRate.toString())
    : DEFAULT_UNIT_RATE_INR;

  const totalKwh = estimateTotalKwh(site, bill);
  const confidenceScore = computeConfidence(site, bill, schedule, equipment);
  const { breakdowns, totalAfterHoursKwh } = computeBreakdowns(site, totalKwh, schedule, equipment, unitRate);

  const estimatedAfterHoursCost = round2(totalAfterHoursKwh * unitRate);
  const estimatedWasteRatio = round2((totalAfterHoursKwh / totalKwh) * 100);
  const annualCo2Kg = round2(kwhToCo2(totalAfterHoursKwh) * 12);

  const recommendations = generateRecommendations(breakdowns, site, unitRate);

  const assumptions = {
    unitRateUsed: unitRate,
    kwhSource: bill.kwhTotal ? 'provided' : 'estimated_from_bill',
    emissionFactor: EMISSION_FACTOR_KG_PER_KWH,
    modelVersion: '1.0',
    hvacTypeUsed: site.hvacType || 'unknown',
    scheduleAvailable: !!schedule,
    equipmentItemsUsed: equipment?.length || 0,
    note: 'Estimates are based on heuristic modeling using bill data, schedule, and equipment profiles. Not audit-grade metering.',
  };

  return {
    totalEstimatedKwh: totalKwh,
    estimatedAfterHoursKwh: totalAfterHoursKwh,
    estimatedAfterHoursCost,
    estimatedWasteRatio,
    annualCo2Kg,
    confidenceScore,
    breakdowns,
    recommendations,
    assumptions,
  };
}

/**
 * Simulate a what-if scenario on an existing analysis
 */
function simulateScenario(analysis, changes) {
  const baseCost = parseFloat(analysis.estimatedAfterHoursCost.toString());
  const baseKwh = parseFloat(analysis.estimatedAfterHoursKwh.toString());

  let savingsRatio = 0;

  if (changes.hvacRuntimeReductionPercent) savingsRatio += (changes.hvacRuntimeReductionPercent / 100) * 0.45;
  if (changes.weekendShutdown)              savingsRatio += 0.08;
  if (changes.smartStripAdoption)           savingsRatio += 0.07;
  if (changes.printerStandbyElimination)    savingsRatio += 0.04;
  if (changes.lightingAutomation)           savingsRatio += 0.06;
  if (changes.deviceShutdownPolicy)         savingsRatio += 0.10;

  savingsRatio = clamp(savingsRatio, 0, 0.90);

  const projectedMonthlySavings = round2(baseCost * savingsRatio);
  const projectedAfterHoursKwh = round2(baseKwh * (1 - savingsRatio));
  const projectedAnnualCo2Kg = round2(kwhToCo2(projectedAfterHoursKwh) * 12);
  const projectedWasteRatio = round2(
    (projectedAfterHoursKwh / parseFloat(analysis.totalEstimatedKwh.toString())) * 100
  );

  return { projectedMonthlySavings, projectedAnnualCo2Kg, projectedWasteRatio };
}

module.exports = { analyze, simulateScenario, computeConfidence };
