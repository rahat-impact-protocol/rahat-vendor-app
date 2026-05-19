const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Disable package exports resolution so Metro uses the CJS build of packages
// like ethers v5 that contain `import.meta` in their ESM output (breaks on web).
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: './global.css' });
