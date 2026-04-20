import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:          '#0D0D0D',
  surface:     '#161616',
  surfaceHigh: '#1E1E1E',
  amber:       '#F59E0B',
  amberDim:    'rgba(245,158,11,0.15)',
  textPrimary: '#F5F0E8',
  textSub:     '#A89E90',
  textMuted:   '#5A5248',
  border:      'rgba(255,255,255,0.07)',
  danger:      '#EF4444',
};

// ─── Tipo do usuário ──────────────────────────────────────────────────────────
type Usuario = {
  nome?: string;
  email?: string;
  tipo?: 'cliente' | 'vendedor';
};

// ─── Item de menu ─────────────────────────────────────────────────────────────
function MenuItem({
  emoji, label, sublabel = '', onPress, perigo = false,
}: {
  emoji: string; label: string; sublabel?: string;
  onPress: () => void; perigo?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={s.menuItem}
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start()}
        activeOpacity={1}
      >
        <View style={[s.menuIconWrap, perigo && s.menuIconPerigo]}>
          <Text style={s.menuEmoji}>{emoji}</Text>
        </View>
        <View style={s.menuInfo}>
          <Text style={[s.menuLabel, perigo && { color: C.danger }]}>{label}</Text>
          {!!sublabel && <Text style={s.menuSublabel}>{sublabel}</Text>}
        </View>
        {!perigo && <Text style={s.menuChevron}>›</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Tela Principal ──────────────────────────────────────────────────────────
export default function Perfil() {
  const router = useRouter();
  const [user, setUser] = useState<Usuario>({});

  const opacity = useRef(new Animated.Value(0)).current;
  const slideY  = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    AsyncStorage.getItem('user').then(raw => {
      if (raw) setUser(JSON.parse(raw));
    }).catch(() => {});

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideY,  { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Inicial do avatar ──
  const inicial = (user.nome ?? 'U')[0].toUpperCase();
  const isVendedor = user.tipo === 'vendedor';

  // ── Sair ──
  function confirmarSair() {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('user');
          router.replace('/login');
        },
      },
    ]);
  }

  return (
    <View style={s.root}>
      {/* Faixa âmbar */}
      <View style={s.topBar} />

      <Animated.ScrollView
        style={{ opacity }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar + nome ── */}
        <Animated.View style={[s.avatarSection, { transform: [{ translateY: slideY }] }]}>
          <View style={s.avatarWrap}>
            <Text style={s.avatarLetra}>{inicial}</Text>
            {isVendedor && (
              <View style={s.vendedorBadge}>
                <Text style={s.vendedorBadgeText}>🍢</Text>
              </View>
            )}
          </View>

          <Text style={s.nome}>{user.nome ?? 'Usuário'}</Text>
          <Text style={s.email}>{user.email ?? ''}</Text>

          <View style={[s.tipoBadge, isVendedor && s.tipoBadgeVendedor]}>
            <Text style={[s.tipoText, isVendedor && s.tipoTextVendedor]}>
              {isVendedor ? '🍢 Vendedor' : '🙋 Cliente'}
            </Text>
          </View>
        </Animated.View>

        {/* ── Stats (mock) ── */}
        <Animated.View style={[s.statsRow, { transform: [{ translateY: slideY }] }]}>
          <View style={s.statCard}>
            <Text style={s.statNum}>0</Text>
            <Text style={s.statLabel}>{isVendedor ? 'Produtos' : 'Pedidos'}</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>0</Text>
            <Text style={s.statLabel}>{isVendedor ? 'Vendas' : 'Favoritos'}</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>—</Text>
            <Text style={s.statLabel}>Avaliação</Text>
          </View>
        </Animated.View>

        {/* ── Menu conta ── */}
        <Animated.View style={[s.secao, { transform: [{ translateY: slideY }] }]}>
          <Text style={s.secaoTitulo}>Conta</Text>
          <View style={s.card}>
            <MenuItem
              emoji="✏️"
              label="Editar perfil"
              sublabel="Nome, foto, informações"
              onPress={() => Alert.alert('Em breve', 'Edição de perfil em desenvolvimento.')}
            />
            <MenuItem
              emoji="🔒"
              label="Alterar senha"
              sublabel="Mude sua senha de acesso"
              onPress={() => Alert.alert('Em breve', 'Em desenvolvimento.')}
            />
            {isVendedor && (
              <MenuItem
                emoji="🍢"
                label="Minha barraca"
                sublabel="Gerencie seus produtos"
                onPress={() => router.push('/publicar')}
              />
            )}
          </View>
        </Animated.View>

        {/* ── Menu preferências ── */}
        <Animated.View style={[s.secao, { transform: [{ translateY: slideY }] }]}>
          <Text style={s.secaoTitulo}>Preferências</Text>
          <View style={s.card}>
            <MenuItem
              emoji="🔔"
              label="Notificações"
              sublabel="Alertas de vendedores próximos"
              onPress={() => Alert.alert('Em breve', 'Em desenvolvimento.')}
            />
            <MenuItem
              emoji="📍"
              label="Localização"
              sublabel="Permissões de GPS"
              onPress={() => Alert.alert('Em breve', 'Em desenvolvimento.')}
            />
          </View>
        </Animated.View>

        {/* ── Menu suporte ── */}
        <Animated.View style={[s.secao, { transform: [{ translateY: slideY }] }]}>
          <Text style={s.secaoTitulo}>Suporte</Text>
          <View style={s.card}>
            <MenuItem
              emoji="❓"
              label="Ajuda"
              sublabel="Perguntas frequentes"
              onPress={() => Alert.alert('Em breve', 'Em desenvolvimento.')}
            />
            <MenuItem
              emoji="⭐"
              label="Avaliar o app"
              onPress={() => Alert.alert('Obrigado!', 'Sua avaliação é muito importante.')}
            />
          </View>
        </Animated.View>

        {/* ── Sair ── */}
        <Animated.View style={[s.secao, { transform: [{ translateY: slideY }] }]}>
          <View style={s.card}>
            <MenuItem
              emoji="🚪"
              label="Sair da conta"
              onPress={confirmarSair}
              perigo
            />
          </View>
        </Animated.View>

        {/* Versão */}
        <Text style={s.versao}>StreetFood v1.0.0</Text>
      </Animated.ScrollView>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  topBar: { height: 3, backgroundColor: C.amber, opacity: 0.85 },
  scroll: { paddingBottom: 40 },

  /* Avatar */
  avatarSection: { alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 56 : 32, paddingBottom: 28 },
  avatarWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: C.amberDim,
    borderWidth: 2, borderColor: C.amber,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, position: 'relative',
  },
  avatarLetra: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 36, fontWeight: '700', color: C.amber,
  },
  vendedorBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: C.bg, borderWidth: 2, borderColor: C.amber,
    alignItems: 'center', justifyContent: 'center',
  },
  vendedorBadgeText: { fontSize: 13 },
  nome:  { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontSize: 22, fontWeight: '700', color: C.textPrimary, marginBottom: 4 },
  email: { fontSize: 13, color: C.textMuted, marginBottom: 12 },
  tipoBadge: {
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20,
    backgroundColor: C.surfaceHigh, borderWidth: 1, borderColor: C.border,
  },
  tipoBadgeVendedor: { backgroundColor: C.amberDim, borderColor: C.amber },
  tipoText:         { fontSize: 12, color: C.textSub, fontWeight: '600' },
  tipoTextVendedor: { color: C.amber },

  /* Stats */
  statsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 28 },
  statCard: { flex: 1, backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, alignItems: 'center', gap: 4 },
  statNum:  { fontSize: 20, fontWeight: '800', color: C.textPrimary },
  statLabel:{ fontSize: 11, color: C.textMuted, letterSpacing: 0.3 },

  /* Seção */
  secao: { marginHorizontal: 20, marginBottom: 16 },
  secaoTitulo: { fontSize: 11, fontWeight: '700', color: C.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },

  /* Menu item */
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  menuIconPerigo: { backgroundColor: 'rgba(239,68,68,0.1)' },
  menuEmoji:   { fontSize: 18 },
  menuInfo:    { flex: 1 },
  menuLabel:   { fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 1 },
  menuSublabel:{ fontSize: 12, color: C.textMuted },
  menuChevron: { fontSize: 20, color: C.textMuted },

  versao: { textAlign: 'center', fontSize: 11, color: C.textMuted, marginTop: 8, letterSpacing: 0.5 },
});