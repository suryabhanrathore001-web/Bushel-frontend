import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bushel.app',
  appName: 'Bushel',
  webDir: 'dist',
  server: {
    cleartext: true,
  },
};

export default config;
