/*import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Vendedor = {
  id: number;
  nome: string;
  tipo: string;
};

export default function Home() {
  const router = useRouter();
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);

  // 🔹 dados locais (garante que a lista aparece)
  useEffect(() => {
    
    setVendedores([
      { id: 1, nome: 'Lanche do João', tipo: 'Hambúrguer' },
      { id: 2, nome: 'Pastel da Maria', tipo: 'Pastel' },
      { id: 3, nome: 'Doce da Ana', tipo: 'Doces' },
    ]);
  }, []);

   async function sair() {
    await AsyncStorage.removeItem('user');
    router.replace('/login');
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#eee'}}>
        🍔 Street Food
      </Text>
      <Text style={{ marginTop: 10, color: '#eee'}}>
        Encontre vendedores perto de você
      </Text>

      <FlatList
        data={vendedores}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }: any) => (
          <TouchableOpacity
           onPress={() => router.push('/login')}
        style={{
          position: 'absolute',
          bottom: 80,
          left: 20,
          right: 20,
          backgroundColor: 'black',
          padding: 15,
          borderRadius: 10,
        }}
      >
            <Text style={{ fontWeight: 'bold' }}>{item.nome}</Text>
            <Text>{item.tipo}</Text>
          </TouchableOpacity>
        )}
      />

        <TouchableOpacity
            onPress={() => router.push('/login')}
            style={{
           position: 'absolute',
          bottom: 80,
          left: 20,
          right: 20,
          backgroundColor: 'black',
          padding: 15,
          borderRadius: 10,
        }}
>
  <Text style={{ color: 'white', textAlign: 'center' }}>
    Sou vendedor
  </Text>
</TouchableOpacity>

   {/* Botão sair }
      <TouchableOpacity
        onPress={sair}
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: 'red',
          padding: 15,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Sair
        </Text>
      </TouchableOpacity>

    </View>
  );
}
*/

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────
type Vendedor = {
  id: number;
  nome: string;
  tipo: string;
  distancia: string;
  avaliacao: number;
  aberto: boolean;
  emoji: string;
};

type Categoria = {
  id: string;
  label: string;
  emoji: string;
};

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
  success:     '#22C55E',
};

// ─── Static Data ──────────────────────────────────────────────────────────────
const VENDEDORES_MOCK: Vendedor[] = [
  { id: 1, nome: 'Lanche do João',    tipo: 'Hambúrguer', distancia: '120m',  avaliacao: 4.8, aberto: true,  emoji: '🍔' },
  { id: 2, nome: 'Pastel da Maria',   tipo: 'Pastel',     distancia: '340m',  avaliacao: 4.5, aberto: true,  emoji: '🥟' },
  { id: 3, nome: 'Doce da Ana',       tipo: 'Doces',      distancia: '510m',  avaliacao: 4.9, aberto: false, emoji: '🍬' },
  { id: 4, nome: 'Espetinho do Beto', tipo: 'Espeto',     distancia: '780m',  avaliacao: 4.2, aberto: true,  emoji: '🍢' },
  { id: 5, nome: 'Tapioca da Lúcia',  tipo: 'Tapioca',    distancia: '1.1km', avaliacao: 4.7, aberto: true,  emoji: '🫓' },
];

const CATEGORIAS: Categoria[] = [
  { id: 'todos',      label: 'Todos',      emoji: '🗺️' },
  { id: 'Hambúrguer', label: 'Hambúrguer', emoji: '🍔' },
  { id: 'Pastel',     label: 'Pastel',     emoji: '🥟' },
  { id: 'Doces',      label: 'Doces',      emoji: '🍬' },
  { id: 'Espeto',     label: 'Espeto',     emoji: '🍢' },
  { id: 'Tapioca',    label: 'Tapioca',    emoji: '🫓' },
];

// ─── Star Rating ──────────────────────────────────────────────────────────────
function Stars({ value }: { value: number }) {
  return (
    <Text style={styles.stars}>
      {'★'.repeat(Math.floor(value))}
      {'☆'.repeat(5 - Math.floor(value))}
    </Text>
  );
}

// ─── Vendor Card ──────────────────────────────────────────────────────────────
function VendorCard({ item, onPress }: { item: Vendedor; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        style={styles.card}
      >
        {/* Emoji avatar */}
        <View style={styles.cardAvatar}>
          <Text style={styles.cardEmoji}>{item.emoji}</Text>
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <View style={styles.cardRow}>
            <Text style={styles.cardNome} numberOfLines={1}>{item.nome}</Text>
            <View style={[styles.badge, item.aberto ? styles.badgeOpen : styles.badgeClosed]}>
              <Text style={styles.badgeText}>{item.aberto ? 'Aberto' : 'Fechado'}</Text>
            </View>
          </View>

          <Text style={styles.cardTipo}>{item.tipo}</Text>

          <View style={styles.cardMeta}>
            <Stars value={item.avaliacao} />
            <Text style={styles.cardAval}>{item.avaliacao.toFixed(1)}</Text>
            <View style={styles.dot} />
            <Text style={styles.cardDist}>📍 {item.distancia}</Text>
          </View>
        </View>

        <Text style={styles.cardChevron}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();

  const [vendedores,  setVendedores]  = useState<Vendedor[]>([]);
  const [busca,       setBusca]       = useState('');
  const [categoria,   setCategoria]   = useState('todos');
  const [loading,     setLoading]     = useState(true);
  const [userName,    setUserName]    = useState('');

  const headerY = useRef(new Animated.Value(-20)).current;
  const headerO = useRef(new Animated.Value(0)).current;

  // ── Load data ──
  useEffect(() => {
    async function init() {
      try {
        const raw = await AsyncStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          setUserName(u.nome ?? '');
        }
      } catch { /* silent */ }

      // Troque por: const res = await fetch(`/vendedores/proximos?lat=X&lon=Y`);
      setTimeout(() => {
        setVendedores(VENDEDORES_MOCK);
        setLoading(false);
      }, 600);
    }
    init();

    Animated.parallel([
      Animated.timing(headerY, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(headerO, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Filter ──
  const listagem = vendedores.filter(v => {
    const matchBusca = v.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       v.tipo.toLowerCase().includes(busca.toLowerCase());
    const matchCat   = categoria === 'todos' || v.tipo === categoria;
    return matchBusca && matchCat;
  });

  // ── Logout ──
  async function sair() {
    await AsyncStorage.removeItem('user');
    router.replace('/login');
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Amber top accent ── */}
      <View style={styles.topAccent} />

      <FlatList
        data={listagem}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}

        // ── Header ──
        ListHeaderComponent={
          <>
            {/* Greeting */}
            <Animated.View style={[styles.greeting, { opacity: headerO, transform: [{ translateY: headerY }] }]}>
              <View>
                <Text style={styles.greetSub}>Olá{userName ? `, ${userName}` : ''}! 👋</Text>
                <Text style={styles.greetTitle}>O que vai ser{'\n'}hoje?</Text>
              </View>
              <TouchableOpacity onPress={sair} style={styles.sairBtn}>
                <Text style={styles.sairIcon}>⏏</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Search */}
            <View style={styles.searchWrap}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar vendedor ou categoria..."
                placeholderTextColor={C.textMuted}
                value={busca}
                onChangeText={setBusca}
                selectionColor={C.amber}
              />
              {busca.length > 0 && (
                <TouchableOpacity onPress={() => setBusca('')}>
                  <Text style={styles.searchClear}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Categories */}
            <FlatList
              data={CATEGORIAS}
              keyExtractor={c => c.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catList}
              renderItem={({ item: cat }) => (
                <TouchableOpacity
                  onPress={() => setCategoria(cat.id)}
                  style={[styles.catChip, categoria === cat.id && styles.catChipActive]}
                >
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.catLabel, categoria === cat.id && styles.catLabelActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* Section heading */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Perto de você</Text>
              <Text style={styles.sectionCount}>{listagem.length} vendedor{listagem.length !== 1 ? 'es' : ''}</Text>
            </View>
          </>
        }

        // ── Cards ──
        renderItem={({ item }) => (
          <VendorCard
            item={item}
            onPress={() => router.push(`/vendedor/${item.id}`)}
          />
        )}

        // ── Loading ──
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator color={C.amber} size="large" />
              <Text style={styles.emptyText}>Buscando vendedores...</Text>
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>🍃</Text>
              <Text style={styles.emptyText}>Nenhum vendedor encontrado</Text>
              <Text style={styles.emptySub}>Tente outra busca ou categoria</Text>
            </View>
          )
        }
      />

      {/* ── Bottom bar ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={() => router.push('/mapa')}
          activeOpacity={0.75}
        >
          <Text style={styles.bottomIcon}>🗺️</Text>
          <Text style={styles.bottomLabel}>Mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomBtn, styles.bottomBtnPrimary]}
          onPress={() => router.push('/vendedor/cadastro')}
          activeOpacity={0.8}
        >
          <Text style={styles.bottomIcon}>🍢</Text>
          <Text style={styles.bottomLabelPrimary}>Sou vendedor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={() => router.push('/perfil')}
          activeOpacity={0.75}
        >
          <Text style={styles.bottomIcon}>👤</Text>
          <Text style={styles.bottomLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  topAccent: {
    height: 3,
    backgroundColor: C.amber,
    opacity: 0.8,
  },

  /* List */
  listContent: {
    paddingBottom: 110,
  },

  /* Greeting */
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 28,
    paddingBottom: 20,
  },
  greetSub: {
    fontSize: 13,
    color: C.textMuted,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  greetTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28,
    fontWeight: '700',
    color: C.textPrimary,
    lineHeight: 34,
  },
  sairBtn: {
    marginTop: 6,
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.surfaceHigh,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sairIcon: {
    fontSize: 16,
    color: C.textMuted,
  },

  /* Search */
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: C.surfaceHigh,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 4,
  },
  searchIcon:  { fontSize: 16, marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.textPrimary,
  },
  searchClear: {
    fontSize: 13,
    color: C.textMuted,
    marginLeft: 8,
    padding: 2,
  },

  /* Categories */
  catList: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.surfaceHigh,
    borderWidth: 1,
    borderColor: C.border,
  },
  catChipActive: {
    backgroundColor: C.amberDim,
    borderColor: C.amber,
  },
  catEmoji: { fontSize: 14 },
  catLabel: {
    fontSize: 13,
    color: C.textSub,
    fontWeight: '500',
  },
  catLabelActive: {
    color: C.amber,
    fontWeight: '700',
  },

  /* Section */
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 17,
    fontWeight: '700',
    color: C.textPrimary,
  },
  sectionCount: {
    fontSize: 12,
    color: C.textMuted,
    letterSpacing: 0.3,
  },

  /* Vendor Card */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 12,
  },
  cardAvatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  cardEmoji: { fontSize: 26 },
  cardInfo:  { flex: 1 },
  cardRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  cardNome: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: C.textPrimary,
    letterSpacing: 0.2,
  },
  cardTipo: {
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars:    { fontSize: 11, color: C.amber },
  cardAval: { fontSize: 11, color: C.textSub, fontWeight: '600' },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: C.textMuted,
    marginHorizontal: 2,
  },
  cardDist: { fontSize: 11, color: C.textMuted },
  cardChevron: {
    fontSize: 22,
    color: C.textMuted,
    marginLeft: 4,
  },

  /* Badge */
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeOpen:   { backgroundColor: 'rgba(34,197,94,0.15)' },
  badgeClosed: { backgroundColor: 'rgba(239,68,68,0.12)' },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: C.textSub,
  },

  /* Empty */
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText:  { fontSize: 15, color: C.textSub,  fontWeight: '600' },
  emptySub:   { fontSize: 13, color: C.textMuted },

  /* Bottom bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  bottomBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 3,
  },
  bottomBtnPrimary: {
    backgroundColor: C.amberDim,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    paddingVertical: 8,
  },
  bottomIcon: { fontSize: 20 },
  bottomLabel: {
    fontSize: 11,
    color: C.textMuted,
    letterSpacing: 0.3,
  },
  bottomLabelPrimary: {
    fontSize: 11,
    color: C.amber,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
