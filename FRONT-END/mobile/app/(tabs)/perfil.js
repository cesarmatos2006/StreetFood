import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth.js';

export default function Perfil() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  const primeiraLetra = user?.nome?.charAt(0).toUpperCase() ?? '?';

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Text style={s.title}>Perfil</Text>

        {/* Avatar */}
        <View style={s.avatarWrapper}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{primeiraLetra}</Text>
          </View>
          <Text style={s.name}>{user?.nome}</Text>
          <Text style={s.email}>{user?.email}</Text>
        </View>

        {/* Infos */}
        {user?.categoria && (
          <View style={s.infoCard}>
            <Text style={s.infoLabel}>Categoria</Text>
            <Text style={s.infoValue}>{user.categoria}</Text>
          </View>
        )}

        <View style={s.infoCard}>
          <Text style={s.infoLabel}>ID do vendedor</Text>
          <Text style={s.infoValue}>#{user?.id}</Text>
        </View>

        {/* Ações */}
        <TouchableOpacity
          style={s.actionBtn}
          onPress={() => router.push('/cadastro-produto')}
        >
          <Text style={s.actionText}>➕ Cadastrar produto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.actionBtn, s.logoutBtn]}
          onPress={handleLogout}
        >
          <Text style={s.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0E0E12' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 8 },
  avatarWrapper: { alignItems: 'center', gap: 8, marginVertical: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: '#fff' },
  email: { fontSize: 14, color: '#666' },
  infoCard: {
    backgroundColor: '#18181F',
    borderWidth: 1.5,
    borderColor: '#2A2A35',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: { fontSize: 13, color: '#888' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#fff' },
  actionBtn: {
    backgroundColor: '#18181F',
    borderWidth: 1.5,
    borderColor: '#FF6B2B',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionText: { color: '#FF6B2B', fontSize: 15, fontWeight: '600' },
  logoutBtn: { borderColor: '#E24B4A', marginTop: 8 },
  logoutText: { color: '#E24B4A', fontSize: 15, fontWeight: '600' },
});