const { withXcodeProject } = require('@expo/config-plugins');

const TARGET = 'linkstockShareExtension';
const DEPLOYMENT_TARGET = '16.4';

module.exports = function withShareExtensionDeploymentTarget(config) {
  console.log('[withShareExtensionDeploymentTarget] plugin invoked');
  return withXcodeProject(config, (cfg) => {
    const xcodeProject = cfg.modResults;
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    let bumped = 0;
    const seenNames = new Set();
    for (const key of Object.keys(configurations)) {
      const entry = configurations[key];
      if (typeof entry !== 'object' || !entry.buildSettings) continue;
      const name = entry.buildSettings.PRODUCT_NAME;
      if (name) seenNames.add(name);
      if (name === TARGET || name === `"${TARGET}"`) {
        entry.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = DEPLOYMENT_TARGET;
        bumped++;
      }
    }
    console.log(`[withShareExtensionDeploymentTarget] bumped ${bumped} configs to ${DEPLOYMENT_TARGET}; PRODUCT_NAMEs seen: ${[...seenNames].join(', ')}`);
    return cfg;
  });
};
