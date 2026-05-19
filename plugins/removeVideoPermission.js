/**
 * Config plugin: removes READ_MEDIA_VIDEO from AndroidManifest.
 * expo-media-library adds it automatically even when the app only
 * saves generated images — not reads or records video.
 */
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function removeVideoPermission(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const permissions = manifest['uses-permission'] || [];
    manifest['uses-permission'] = permissions.filter(
      (p) => p.$['android:name'] !== 'android.permission.READ_MEDIA_VIDEO'
    );
    return config;
  });
};
