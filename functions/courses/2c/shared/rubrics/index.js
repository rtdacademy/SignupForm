/**
 * Central export for all assessment rubrics
 * This allows easy import of all rubrics from a single location
 */

const { MOMENTUM_RUBRICS } = require('./momentum-rubrics');

module.exports = {
  MOMENTUM_RUBRICS,
  // Add other subject rubrics here as they are created:
  // KINEMATICS_RUBRICS,
  // FORCES_RUBRICS,
  // ENERGY_RUBRICS,
  // etc.
};