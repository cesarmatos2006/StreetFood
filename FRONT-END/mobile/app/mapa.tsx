import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

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
  success:     '#22C55E',
  danger:      '#EF4444',
};

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Vendedor = {
  id: number;
  nome: string;
  tipo: string;
  distancia: string;
  avaliacao: number;
  aberto: boolean;
  emoji: string;
  lat: number;
  lon: number;
};

// ─── Mock com coordenadas (São Paulo centro) ──────────────────────────────────
const VENDEDORES_MOCK: Vendedor[] = [
  { id: 1, nome: 'Lanche do João',    tipo: 'Hambúrguer', distancia: '120m',  avaliacao: 4.8, aberto: true,  emoji: '🍔', lat: -23.5505, lon: -46.6333 },
  { id: 2, nome: 'Pastel da Maria',   tipo: 'Pastel',     distancia: '340m',  avaliacao: 4.5, aberto: true,  emoji: '🥟', lat: -23.5515, lon: -46.6350 },
  { id: 3, nome: 'Doce da Ana',       tipo: 'Doces',      distancia: '510m',  avaliacao: 4.9, aberto: false, emoji: '🍬', lat: -23.5490, lon: -46.6310 },
  { id: 4, nome: 'Espetinho do Beto', tipo: 'Espeto',     distancia: '780m',  avaliacao: 4.2, aberto: true,  emoji: '🍢', lat: -23.5530, lon: -46.6360 },
  { id: 5, nome: 'Tapioca da Lúcia',  tipo: 'Tapioca',    distancia: '1.1km', avaliacao: 4.7, aberto: true,  emoji: '🫓', lat: -23.5480, lon: -46.6290 },
];

// ─── Card da lista abaixo do mapa ─────────────────────────────────────────────
function VendorRow({ item, onPress }: { item: Vendedor; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={s.row}
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start()}
        activeOpacity={1}
      >
        <View style={s.rowAvatar}>
          <Text style={s.rowEmoji}>{item.emoji}</Text>
        </View>
        <View style={s.rowInfo}>
          <Text style={s.rowNome} numberOfLines={1}>{item.nome}</Text>
          <Text style={s.rowTipo}>{item.tipo} · {item.distancia}</Text>
          <Text style={s.rowAval}>{'★'.repeat(Math.floor(item.avaliacao))} {item.avaliacao.toFixed(1)}</Text>
        </View>
        <View style={[s.statusDot, { backgroundColor: item.aberto ? C.success : C.danger }]} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Tela Principal ──────────────────────────────────────────────────────────
export default function Mapa() {
  const router = useRouter();
  const [loading,    setLoading]    = useState(true);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [pinSel,     setPinSel]     = useState<number | null>(null);

  const headerO = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    // Aqui você pode integrar expo-location:
    // const { status } = await Location.requestForegroundPermissionsAsync();
    // const loc = await Location.getCurrentPositionAsync({});
    // depois faz fetch: /vendedores/proximos?lat=loc.coords.latitude&lon=loc.coords.longitude

    setTimeout(() => {
      setVendedores(VENDEDORES_MOCK);
      setLoading(false);
    }, 700);

    Animated.parallel([
      Animated.timing(headerO, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(headerY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  function irParaVendedor(v: Vendedor) {
    router.push({
      pathname: '/vendedor',
      params: {
        id:        String(v.id),
        nome:      v.nome,
        tipo:      v.tipo,
        distancia: v.distancia,
        avaliacao: String(v.avaliacao),
        aberto:    String(v.aberto),
        emoji:     v.emoji,
      },
    });
  }

  return (
    <View style={s.root}>
      {/* ── Cabeçalho ── */}
      <Animated.View style={[s.header, { opacity: headerO, transform: [{ translateY: headerY }] }]}>
        <Text style={s.headerSub}>Vendedores próximos</Text>
        <Text style={s.headerTitulo}>Mapa</Text>
      </Animated.View>

      {/* ── Mapa placeholder ─────────────────────────────────────────────────
          Para usar mapa real, instale:
            npx expo install react-native-maps
          E substitua este bloco por:
            <MapView style={s.mapa} region={{ latitude: -23.5505, longitude: -46.6333, latitudeDelta: 0.02, longitudeDelta: 0.02 }}>
              {vendedores.map(v => (
                <Marker key={v.id} coordinate={{ latitude: v.lat, longitude: v.lon }}
                  onPress={() => setPinSel(v.id)}>
                  <Text style={s.pin}>{v.emoji}</Text>
                </Marker>
              ))}
            </MapView>
      ── */}
      <View style={s.mapaPlaceholder}>
        {loading ? (
          <ActivityIndicator color={C.amber} size="large" />
        ) : (
          <>
            {/* Grade de fundo imitando mapa */}
            {[...Array(8)].map((_, i) => (
              <View key={`h${i}`} style={[s.gridH, { top: `${i * 14}%` as any }]} />
            ))}
            {[...Array(6)].map((_, i) => (
              <View key={`v${i}`} style={[s.gridV, { left: `${i * 20}%` as any }]} />
            ))}

            {/* Pins dos vendedores */}
            {vendedores.map((v, i) => (
              <TouchableOpacity
                key={v.id}
                style={[
                  s.pin,
                  { top: `${20 + i * 12}%` as any, left: `${15 + i * 15}%` as any },
                  pinSel === v.id && s.pinSelecionado,
                ]}
                onPress={() => setPinSel(v.id === pinSel ? null : v.id)}
              >
                <Text style={s.pinEmoji}>{v.emoji}</Text>
                {pinSel === v.id && (
                  <View style={s.pinLabel}>
                    <Text style={s.pinLabelText} numberOfLines={1}>{v.nome}</Text>
                    <Text style={s.pinLabelDist}>{v.distancia}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Pin do usuário */}
            <View style={s.userPin}>
              <View style={s.userPinDot} />
              <View style={s.userPinRing} />
            </View>

            {/* Label do mapa */}
            <View style={s.mapaLabel}>
              <Text style={s.mapaLabelText}>
                📍 Instale react-native-maps para mapa real
              </Text>
            </View>
          </>
        )}
      </View>

      {/* ── Lista de vendedores ── */}
      <View style={s.listaWrap}>
        <View style={s.listaHandle} />

        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={C.amber} />
            <Text style={s.loadingText}>Localizando vendedores...</Text>
          </View>
        ) : (
          <FlatList
            data={vendedores}
            keyExtractor={item => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
            ListHeaderComponent={
              <View style={s.listaHeader}>
                <Text style={s.listaTitulo}>Perto de você</Text>
                <Text style={s.listaCount}>{vendedores.length} vendedores</Text>
              </View>
            }
            renderItem={({ item }) => (
              <VendorRow
                item={item}
                onPress={() => irParaVendedor(item)}
              />
            )}
          />
        )}
      </View>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  /* Header */
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 28,
    paddingBottom: 12,
  },
  headerSub: { fontSize: 12, color: C.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 },
  headerTitulo: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28, fontWeight: '700', color: C.textPrimary,
  },

  /* Mapa */
  mapaPlaceholder: {
    height: 280,
    backgroundColor: '#111',
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    position: 'relative',
  },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.04)' },

  pin: {
    position: 'absolute',
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: C.surface,
    borderWidth: 2, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  pinSelecionado: {
    borderColor: C.amber,
    backgroundColor: C.amberDim,
    zIndex: 10,
  },
  pinEmoji: { fontSize: 22 },
  pinLabel: {
    position: 'absolute',
    bottom: -46,
    backgroundColor: C.surface,
    borderRadius: 8, borderWidth: 1, borderColor: C.amber,
    paddingHorizontal: 8, paddingVertical: 4,
    minWidth: 100, alignItems: 'center',
  },
  pinLabelText: { fontSize: 11, color: C.textPrimary, fontWeight: '700' },
  pinLabelDist: { fontSize: 10, color: C.textMuted },

  userPin: {
    position: 'absolute',
    bottom: '35%', right: '30%',
    alignItems: 'center', justifyContent: 'center',
    width: 20, height: 20,
  },
  userPinDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6', zIndex: 2 },
  userPinRing: {
    position: 'absolute',
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: 'rgba(59,130,246,0.4)',
  },

  mapaLabel: {
    position: 'absolute', bottom: 10, left: 0, right: 0, alignItems: 'center',
  },
  mapaLabelText: {
    fontSize: 10, color: C.textMuted,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },

  /* Lista */
  listaWrap: {
    flex: 1,
    marginTop: 16,
    backgroundColor: C.surface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  listaHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center', marginBottom: 16,
  },
  listaHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  listaTitulo: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 16, fontWeight: '700', color: C.textPrimary,
  },
  listaCount: { fontSize: 12, color: C.textMuted },

  /* Row */
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  rowAvatar: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: C.surfaceHigh,
    borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  rowEmoji:  { fontSize: 22 },
  rowInfo:   { flex: 1 },
  rowNome:   { fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 2 },
  rowTipo:   { fontSize: 12, color: C.textMuted, marginBottom: 2 },
  rowAval:   { fontSize: 11, color: C.amber },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  /* Loading */
  loadingWrap: { alignItems: 'center', paddingTop: 30, gap: 10 },
  loadingText: { fontSize: 13, color: C.textMuted },
});