import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

/**
 * Request notification permissions from the user.
 */
export async function requestNotificationPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Notification permissions enabled.');
  } else {
    Alert.alert('Permissions Denied', 'Please enable notifications in your device settings.');
  }
}

/**
 * Subscribe the device to a specific topic.
 * @param topic Topic name (e.g., 'sensor-alerts')
 */
export async function subscribeToTopic(topic: string) {
  try {
    await messaging().subscribeToTopic(topic);
    console.log(`Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error('Error subscribing to topic:', error);
  }
}

// Save notification to AsyncStorage
export async function saveNotification(notification: any) {
  const storedNotifications = (await AsyncStorage.getItem('notifications')) || '[]';
  const notifications = JSON.parse(storedNotifications);

  notifications.unshift({
    id: Date.now().toString(),
    title: notification.notification?.title || 'Notification',
    body: notification.notification?.body || '',
    timestamp: new Date().toLocaleString(),
  });

  await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
}

// Handle notifications when the app is in the foreground
export function handleForegroundMessages() {
  messaging().onMessage(async (remoteMessage) => {
    console.log('Message received in foreground:', remoteMessage);
    await saveNotification(remoteMessage);
    Alert.alert(remoteMessage.notification?.title || 'Notification', remoteMessage.notification?.body || '');
  });
}

// Handle background and terminated state notifications
export function handleBackgroundMessages() {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Message received in background:', remoteMessage);
    await saveNotification(remoteMessage);
  });
}
