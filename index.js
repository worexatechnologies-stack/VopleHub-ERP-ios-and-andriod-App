// Register background notification handler for Android / iOS
try {
  const messagingModule = require('@react-native-firebase/messaging');
  const messaging = messagingModule.default || messagingModule;
  if (typeof messaging === 'function') {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('[FCM Background] Remote message received in background/closed state:', remoteMessage?.notification?.title);
    });
  }
} catch (e) {}

/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
