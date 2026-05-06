import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../hooks/useAuth';

function RootRedirect() {
  const { user, ready } = useAuth();
  const router  = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // ✅ Não redireciona antes de ler o AsyncStorage —
    //    evita o flash de tela branca/login no iOS
    if (!ready) return;

    const inAuth = segments[0] === '(auth)';
    const inTabs = segments[0] === '(tabs)';
    const inRoot = segments[0] === undefined;

    if (user && (inAuth || inRoot)) {
      router.replace('/home');
    } else if (!user && inTabs) {
      router.replace('/');
    }
  }, [user, segments, ready]);

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