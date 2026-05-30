/**
 * Config plugin: removes READ_MEDIA_IMAGES from AndroidManifest.
 * expo-media-library adds it automatically, but the app only needs
 * write access (saveToLibraryAsync) — not persistent read access.
 * Play Store policy rejects READ_MEDIA_IMAGES without core-feature justification.
 */
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function removeImagePermission(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const permissions = manifest['uses-permission'] || [];
    manifest['uses-permission'] = permissions.filter(
      (p) => p.$['android:name'] !== 'android.permission.READ_MEDIA_IMAGES'
    );
    return config;
  });
};
