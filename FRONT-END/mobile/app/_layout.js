import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../hooks/useAuth';

function RootRedirect() {
  const { user } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (user && (inAuthGroup || segments[0] === undefined)) {
      router.replace('/home');
    } else if (!user && inTabsGroup) {
      router.replace('/');
    }
  }, [user, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootRedirect />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}