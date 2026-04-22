import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { api } from '../../api';
import { useAuth } from '../../hooks/useAuth.js';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const [vendedores, setVendedores] = useState([]);
  const [categorias, setCategorias] = useState([{ id: null, nome: 'Todos' }]);
  const [catSelecionada, setCatSelecionada] = useState(null);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [coords, setCoords] = useState(null);

  const carregarDados = useCallback(async (lat, lon) => {
    try {
      const [vends, cats] = await Promise.all([
        api.getVendedoresProximos(lat, lon, {
          raio: 10,
          ...(catSelecionada && { categoria_id: catSelecionada }),
        }),
        api.getCategorias(),
      ]);
      setVendedores(vends);
      setCategorias([{ id: null, nome: 'Todos' }, ...cats]);
    } catch {
      // sem conexão — mantém dados anteriores
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [catSelecionada]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLoading(false); return; }
      const { coords: c } = await Location.getCurrentPositionAsync();
      setCoords(c);
      carregarDados(c.latitude, c.longitude);
    })();
  }, []);

  useEffect(() => {
    if (coords) carregarDados(coords.latitude, coords.longitude);
  }, [catSelecionada]);

  const onRefresh = () => {
    if (!coords) return;
    setRefreshing(true);
    carregarDados(coords.latitude, coords.longitude);
  };

  const filtrados = vendedores.filter((v) =>
    v.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const primeiraLetra = user?.nome?.charAt(0).toUpperCase() ?? '?';

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Boa tarde,</Text>
          <Text style={s.userName}>{user?.nome ?? 'Visitante'} 👋</Text>
        </View>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{primeiraLetra}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchBar}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar comida ou vendedor..."
          placeholderTextColor="#555"
        />
      </View>

      {/* Categorias */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.catScroll}
      >
        {categorias.map((c) => (
          <TouchableOpacity
            key={String(c.id)}
            style={[s.catChip, catSelecionada === c.id && s.catChipActive]}
            onPress={() => setCatSelecionada(c.id)}
          >
            <Text style={[s.catText, catSelecionada === c.id && s.catTextActive]}>
              {c.nome}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={s.sectionTitle}>Próximos de você</Text>

      {loading ? (
        <ActivityIndicator color="#FF6B2B" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF6B2B"
            />
          }
          ListEmptyComponent={
            <Text style={s.empty}>Nenhum vendedor encontrado.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => router.push(`/cardapio/${item.id}`)}
              activeOpacity={0.8}
            >
              <View style={s.thumb}>
                <Text style={{ fontSize: 26 }}>🍔</Text>
              </View>
              <View style={s.cardInfo}>
                <Text style={s.cardName}>{item.nome}</Text>
                {item.categoria && (
                  <Text style={s.cardMeta}>{item.categoria}</Text>
                )}
                <View style={s.cardTags}>
                  <View style={[s.tag, item.aberto_agora ? s.tagAberto : s.tagFechado]}>
                    <Text style={[s.tagText, item.aberto_agora ? s.tagTextAberto : s.tagTextFechado]}>
                      {item.aberto_agora === null ? 'Sem horário' : item.aberto_agora ? 'Aberto' : 'Fechado'}
                    </Text>
                  </View>
                  {item.avaliacao_media && (
                    <View style={s.tagStar}>
                      <Text style={s.tagText}>⭐ {item.avaliacao_media}</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={s.dist}>
                {item.distancia_km ? `${item.distancia_km} km` : ''}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0E0E12' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    marginBottom: 16,
  },
  greeting: { fontSize: 13, color: '#888' },
  userName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FF6B2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181F',
    borderWidth: 1.5,
    borderColor: '#2A2A35',
    borderRadius: 12,
    marginHorizontal: 18,
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 12 },
  catScroll: { paddingHorizontal: 18, gap: 8, marginBottom: 16 },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#2A2A35',
  },
  catChipActive: { backgroundColor: '#FF6B2B', borderColor: '#FF6B2B' },
  catText: { color: '#888', fontSize: 13, fontWeight: '600' },
  catTextActive: { color: '#fff' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  list: { paddingHorizontal: 18, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: '#18181F',
    borderWidth: 1.5,
    borderColor: '#2A2A35',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FF6B2B22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 3 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#fff' },
  cardMeta: { fontSize: 12, color: '#666' },
  cardTags: { flexDirection: 'row', gap: 6, marginTop: 2 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagAberto: { backgroundColor: '#1A3D2B' },
  tagFechado: { backgroundColor: '#2A1A1A' },
  tagStar: { backgroundColor: '#2A2A10', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: '600' },
  tagTextAberto: { color: '#4CAF50' },
  tagTextFechado: { color: '#E24B4A' },
  dist: { fontSize: 12, color: '#888' },
  empty: { color: '#555', textAlign: 'center', marginTop: 40, fontSize: 15 },
});