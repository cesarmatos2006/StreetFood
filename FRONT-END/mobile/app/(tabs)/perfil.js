import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth.js';

export default function Perfil() {
  const router = useRouter();
  const { user, logout, isVendedor } = useAuth();

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

  // ✅ CORREÇÃO: só vendedores acessam cadastro de produto
  const irParaCadastroProduto = () => {
    if (!isVendedor) {
      Alert.alert(
        'Acesso restrito',
        'Somente vendedores podem cadastrar produtos. Crie uma conta de vendedor para continuar.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    router.push('/cadastro-produto');
  };

  const primeiraLetra = user?.nome?.charAt(0).toUpperCase() ?? '?';

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Text style={s.title}>Perfil</Text>

        {/* Avatar */}
        <View style={s.avatarWrapper}>
          <View style={[s.avatar, !isVendedor && s.avatarCliente]}>
            <Text style={s.avatarText}>{primeiraLetra}</Text>
          </View>
          <Text style={s.name}>{user?.nome}</Text>
          <Text style={s.email}>{user?.email}</Text>

          {/* ✅ Badge de tipo de conta */}
          <View style={[s.tipoBadge, isVendedor ? s.tipoBadgeVendedor : s.tipoBadgeCliente]}>
            <Text style={[s.tipoBadgeText, isVendedor ? s.tipoVendedorText : s.tipoClienteText]}>
              {isVendedor ? '🏪 Vendedor' : '🗺️ Cliente'}
            </Text>
          </View>
        </View>

        {/* Infos — só aparecem para vendedor */}
        {isVendedor && user?.categoria && (
          <View style={s.infoCard}>
            <Text style={s.infoLabel}>Categoria</Text>
            <Text style={s.infoValue}>{user.categoria}</Text>
          </View>
        )}

        {isVendedor && (
          <View style={s.infoCard}>
            <Text style={s.infoLabel}>ID do vendedor</Text>
            <Text style={s.infoValue}>#{user?.id}</Text>
          </View>
        )}

        {/* ✅ Botão de cadastrar produto:
              - Vendedor: aparece normalmente
              - Cliente: aparece acinzentado e mostra aviso ao tocar */}
        <TouchableOpacity
          style={[s.actionBtn, !isVendedor && s.actionBtnDisabled]}
          onPress={irParaCadastroProduto}
          activeOpacity={isVendedor ? 0.75 : 0.5}
        >
          <Text style={[s.actionText, !isVendedor && s.actionTextDisabled]}>
            {isVendedor ? '➕ Cadastrar produto' : '🔒 Cadastrar produto (vendedores)'}
          </Text>
        </TouchableOpacity>

        {isVendedor && (
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => router.push('/horarios')}
          >
            <Text style={s.actionText}>🕐 Horários de funcionamento</Text>
          </TouchableOpacity>
        )}

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
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FF6B2B',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarCliente: { backgroundColor: '#2A2A8A' }, // azul para clientes
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: '#fff' },
  email: { fontSize: 14, color: '#666' },

  tipoBadge: {
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1.5, marginTop: 4,
  },
  tipoBadgeVendedor: { borderColor: '#FF6B2B44', backgroundColor: '#FF6B2B11' },
  tipoBadgeCliente: { borderColor: '#4444FF44', backgroundColor: '#4444FF11' },
  tipoBadgeText: { fontSize: 12, fontWeight: '600' },
  tipoVendedorText: { color: '#FF8C50' },
  tipoClienteText: { color: '#8080FF' },

  infoCard: {
    backgroundColor: '#18181F',
    borderWidth: 1.5, borderColor: '#2A2A35',
    borderRadius: 12, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  infoLabel: { fontSize: 13, color: '#888' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#fff' },

  actionBtn: {
    backgroundColor: '#18181F',
    borderWidth: 1.5, borderColor: '#FF6B2B',
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  // ✅ visual acinzentado para clientes
  actionBtnDisabled: { borderColor: '#2A2A35', opacity: 0.5 },
  actionText: { color: '#FF6B2B', fontSize: 15, fontWeight: '600' },
  actionTextDisabled: { color: '#555' },

  logoutBtn: { borderColor: '#E24B4A', marginTop: 8 },
  logoutText: { color: '#E24B4A', fontSize: 15, fontWeight: '600' },
});