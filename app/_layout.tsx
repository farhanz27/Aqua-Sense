import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { View, ActivityIndicator } from 'react-native';
import { requestNotificationPermission, subscribeToTopic, handleForegroundMessages, handleBackgroundMessages } from '../utils/notifications';

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const router = useRouter();
  const segments = useSegments();

  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    setUser(user);
    if (initializing) setInitializing(false);
  };

  // Monitor Auth State
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  // Handle Routing
  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (user && !inAuthGroup) {
      router.replace('/(auth)/(tabs)/dashboard');
    } else if (!user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, initializing]);

  // Initialize FCM after Auth resolves
  useEffect(() => {
    if (!initializing && user) {
      const initializeFCM = async () => {
        await requestNotificationPermission();
        await subscribeToTopic('sensor-alerts');
        await subscribeToTopic(`user-${user.uid}`);
        handleForegroundMessages(); // Handle foreground notifications
        handleBackgroundMessages(); // Handle background notifications
      };

      initializeFCM();
    }
  }, [user, initializing]);

  if (initializing)
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}
