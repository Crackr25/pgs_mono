const sharedConfig = require('../../shared/configs/eslint.config.js');

module.exports = {
  ...sharedConfig,
  extends: [
    ...sharedConfig.extends,
    'next/core-web-vitals'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
};
