module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // FINDING RN-04: strip console.* from release bundles (no PII in Logcat/Console).
  env: {
    production: {
      plugins: [['transform-remove-console', { exclude: ['error', 'warn'] }]],
    },
  },
};
