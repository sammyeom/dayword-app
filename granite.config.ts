import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  scheme: 'intoss',
  appName: 'dayword-mbti',
  plugins: [
    appsInToss({
      appType: 'general',
      brand: {
        displayName: '오늘의 한마디',
        primaryColor: '#6C5CE7',
        icon: 'https://static.toss.im/appsintoss/dayword/icon.png',
      },
      permissions: [],
      navigationBar: {
        withBackButton: true,
        withHomeButton: true,
      },
      bridgeColorMode: 'basic',
    }),
  ],
});
