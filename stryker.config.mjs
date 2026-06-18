/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'dashboard'],
  testRunner: 'jest',
  coverageAnalysis: 'perTest',
  mutate: [
    'backend/src/strategies/**/*.ts',
    'backend/src/services/emissionService.ts',
    '!**/*.test.ts',
    '!**/*.spec.ts',
  ],
  thresholds: {
    high: 90,   // mutation score ≥90 = green
    low: 80,    // mutation score ≥80 = yellow
    break: 75,  // fail CI if mutation score < 75
  },
  jest: {
    projectType: 'custom',
    configFile: 'backend/jest.config.js',
  },
};
