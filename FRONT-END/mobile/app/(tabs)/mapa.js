import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, FlatList,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { api } from '../../api';

export default function Mapa() {
  const router = useRouter();
  const mapRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecionado, setSelecionado] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLoading(false); return; }
      const { coords: c } = await Location.getCurrentPositionAsync();
      setCoords(c);

      const vends = await api.getVendedoresProximos(c.latitude, c.longitude, { raio: 10 });
      setVendedores(vends);
      setLoading(false);
    })();
  }, []);

  const centralizarVendedor = (v) => {
    setSelecionado(v.id);
    mapRef.current?.animateToRegion({
      latitude: v.latitude,
      longitude: v.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 600);
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <ActivityIndicator color="#FF6B2B" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      {coords ? (
        <MapView
          ref={mapRef}
          style={s.map}
          customMapStyle={darkMapStyle}
          initialRegion={{
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          showsUserLocation
        >
          {/* Raio de busca */}
          <Circle
            center={{ latitude: coords.latitude, longitude: coords.longitude }}
            radius={1000}
            strokeColor="#FF6B2B44"
            fillColor="#FF6B2B11"
          />

          {/* Pinos dos vendedores */}
          {vendedores.map((v) => (
            <Marker
              key={v.id}
              coordinate={{ latitude: v.latitude, longitude: v.longitude }}
              onPress={() => centralizarVendedor(v)}
            >
              <View style={[s.pin, selecionado === v.id && s.pinActive]}>
                <Text style={{ fontSize: 18 }}>🍔</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={s.noLocation}>
          <Text style={s.noLocationText}>Localização não disponível</Text>
        </View>
      )}

      {/* Lista flutuante */}
      <View style={s.listCard}>
        <Text style={s.listTitle}>
          {vendedores.length} vendedor{vendedores.length !== 1 ? 'es' : ''} encontrado{vendedores.length !== 1 ? 's' : ''}
        </Text>
        <FlatList
          data={vendedores}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 240 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.listItem, selecionado === item.id && s.listItemActive]}
              onPress={() => centralizarVendedor(item)}
            >
              <View style={s.listIcon}>
                <Text style={{ fontSize: 20 }}>🍔</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.listName}>{item.nome}</Text>
                <Text style={s.listDist}>
                  {item.distancia_km} km •{' '}
                  <Text style={{ color: item.aberto_agora ? '#4CAF50' : '#E24B4A' }}>
                    {item.aberto_agora ? 'Aberto' : 'Fechado'}
                  </Text>
                </Text>
              </View>
              <TouchableOpacity
                style={s.listBtn}
                onPress={() => router.push(`/cardapio/${item.id}`)}
              >
                <Text style={s.listBtnText}>Ver →</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

// Estilo escuro para o mapa
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#14141C' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#888' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1C1C28' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0E0E18' }] },
];

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0E0E12' },
  map: { flex: 1 },
  noLocation: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noLocationText: { color: '#888', fontSize: 16 },
  pin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#18181F',
    borderWidth: 2,
    borderColor: '#2A2A35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinActive: { borderColor: '#FF6B2B', borderWidth: 2.5 },
  listCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#14141C',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: '#1E1E28',
    padding: 16,
    paddingBottom: 24,
  },
  listTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 12 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E28',
  },
  listItemActive: { backgroundColor: '#FF6B2B11', borderRadius: 10, paddingHorizontal: 8 },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#18181F',
    borderWidth: 1.5,
    borderColor: '#2A2A35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listName: { fontSize: 13, fontWeight: '600', color: '#fff' },
  listDist: { fontSize: 11, color: '#666' },
  listBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FF6B2B22',
  },
  listBtnText: { color: '#FF6B2B', fontSize: 12, fontWeight: '600' },
});