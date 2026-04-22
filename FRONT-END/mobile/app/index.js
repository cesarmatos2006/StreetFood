import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Splash() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <View style={s.logoRing}>
          <Text style={s.logoEmoji}>🍔</Text>
        </View>

        <Text style={s.title}>StreetFood</Text>
        <Text style={s.subtitle}>
          Encontre trailers e barracas de comida perto de você
        </Text>

        <View style={s.buttons}>
          <TouchableOpacity
            style={s.btnPrimary}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={s.btnPrimaryText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnGhost}
            onPress={() => router.push('/(auth)/cadastro')}
          >
            <Text style={s.btnGhostText}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0E0E12' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FF6B2B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoEmoji: { fontSize: 40 },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
    marginBottom: 16,
  },
  buttons: { width: '100%', gap: 12 },
  btnPrimary: {
    backgroundColor: '#FF6B2B',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnGhost: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF6B2B',
  },
  btnGhostText: { color: '#FF6B2B', fontSize: 16, fontWeight: '600' },
});