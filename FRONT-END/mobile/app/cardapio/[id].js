import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
  SafeAreaView, ActivityIndicator, Modal, TextInput, Alert, ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../api';

export default function Cardapio() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [vendedor, setVendedor] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [aba, setAba] = useState('cardapio'); // 'cardapio' | 'avaliacoes'
  const [loading, setLoading] = useState(true);

  // Modal avaliação
  const [modalVisible, setModalVisible] = useState(false);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [autorNome, setAutorNome] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getVendedor(id),
      api.getProdutos(id),
      api.getAvaliacoes(id),
    ]).then(([v, p, a]) => {
      setVendedor(v);
      setProdutos(p);
      setAvaliacoes(a);
      setLoading(false);
    });
  }, [id]);

  const enviarAvaliacao = async () => {
    if (!autorNome) { Alert.alert('Atenção', 'Informe seu nome.'); return; }
    setEnviando(true);
    try {
      await api.avaliar(id, { nota, comentario, autor_nome: autorNome });
      const novas = await api.getAvaliacoes(id);
      setAvaliacoes(novas);
      setModalVisible(false);
      setComentario('');
      setAutorNome('');
      setNota(5);
      Alert.alert('Obrigado!', 'Avaliação enviada com sucesso.');
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar a avaliação.');
    } finally {
      setEnviando(false);
    }
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
      {/* Hero */}
      <View style={s.hero}>
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Text style={s.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 40 }}>🍔</Text>
        <Text style={s.heroName}>{vendedor?.nome}</Text>
        <Text style={s.heroSub}>
          {vendedor?.categoria} • {vendedor?.descricao ?? 'Comida de rua'}
        </Text>
      </View>

      {/* Stats */}
      <View style={s.stats}>
        <View style={s.stat}>
          <Text style={s.statVal}>
            {vendedor?.avaliacao_media ?? '–'}
          </Text>
          <Text style={s.statLbl}>Avaliação</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statVal}>
            {vendedor?.distancia_km ? `${vendedor.distancia_km}km` : '–'}
          </Text>
          <Text style={s.statLbl}>Distância</Text>
        </View>
        <View style={s.stat}>
          <Text style={[s.statVal, { color: vendedor?.aberto_agora ? '#4CAF50' : '#E24B4A' }]}>
            {vendedor?.aberto_agora === null ? 'N/A' : vendedor?.aberto_agora ? 'Aberto' : 'Fechado'}
          </Text>
          <Text style={s.statLbl}>Status</Text>
        </View>
      </View>

      {/* Abas */}
      <View style={s.tabs}>
        {['cardapio', 'avaliacoes'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.tab, aba === t && s.tabActive]}
            onPress={() => setAba(t)}
          >
            <Text style={[s.tabText, aba === t && s.tabTextActive]}>
              {t === 'cardapio' ? 'Cardápio' : `Avaliações (${avaliacoes.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conteúdo */}
      {aba === 'cardapio' ? (
        <FlatList
          data={produtos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={s.empty}>Nenhum produto cadastrado.</Text>
          }
          renderItem={({ item }) => (
            <View style={s.productCard}>
              <View style={s.productThumb}>
                <Text style={{ fontSize: 26 }}>🍽️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.productName}>{item.nome}</Text>
                {item.descricao && (
                  <Text style={s.productDesc} numberOfLines={2}>{item.descricao}</Text>
                )}
                <View style={s.productRow}>
                  <Text style={s.productPrice}>
                    R$ {Number(item.preco).toFixed(2)}
                  </Text>
                  <TouchableOpacity style={s.addBtn}>
                    <Text style={s.addBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={avaliacoes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <TouchableOpacity
              style={s.avaliarBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={s.avaliarBtnText}>⭐ Avaliar este vendedor</Text>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <Text style={s.empty}>Nenhuma avaliação ainda. Seja o primeiro!</Text>
          }
          renderItem={({ item }) => (
            <View style={s.avalCard}>
              <View style={s.avalHeader}>
                <Text style={s.avalAutor}>{item.autor_nome ?? 'Anônimo'}</Text>
                <Text style={s.avalNota}>{'⭐'.repeat(item.nota)}</Text>
              </View>
              {item.comentario && (
                <Text style={s.avalComent}>{item.comentario}</Text>
              )}
              <Text style={s.avalData}>
                {new Date(item.criado_em).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          )}
        />
      )}

      {/* Modal avaliação */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Avaliar vendedor</Text>

            <Text style={s.label}>Seu nome</Text>
            <TextInput
              style={s.input}
              value={autorNome}
              onChangeText={setAutorNome}
              placeholder="Ex: Maria Silva"
              placeholderTextColor="#555"
            />

            <Text style={s.label}>Nota</Text>
            <View style={s.notaRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity key={n} onPress={() => setNota(n)}>
                  <Text style={{ fontSize: 28 }}>{n <= nota ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Comentário (opcional)</Text>
            <TextInput
              style={[s.input, { height: 80, textAlignVertical: 'top' }]}
              value={comentario}
              onChangeText={setComentario}
              placeholder="Conte como foi a experiência..."
              placeholderTextColor="#555"
              multiline
            />

            <View style={s.modalBtns}>
              <TouchableOpacity
                style={s.modalCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={s.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalEnviar} onPress={enviarAvaliacao} disabled={enviando}>
                {enviando
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.modalEnviarText}>Enviar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0E0E12' },
  hero: {
    backgroundColor: '#14141C',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
    gap: 4,
  },
  back: { alignSelf: 'flex-start', marginLeft: 18, marginBottom: 8 },
  backText: { color: '#888', fontSize: 15 },
  heroName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  heroSub: { fontSize: 13, color: '#888' },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: '#18181F',
    borderWidth: 1.5,
    borderColor: '#2A2A35',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statVal: { fontSize: 16, fontWeight: '700', color: '#FF6B2B' },
  statLbl: { fontSize: 11, color: '#666', marginTop: 2 },
  tabs: { flexDirection: 'row', paddingHorizontal: 18, gap: 8, marginBottom: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  tabActive: { backgroundColor: '#FF6B2B20' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '600' },
  tabTextActive: { color: '#FF6B2B' },
  list: { paddingHorizontal: 18, paddingBottom: 24, gap: 10 },
  empty: { color: '#555', textAlign: 'center', marginTop: 32, fontSize: 14 },
  productCard: {
    backgroundColor: '#18181F',
    borderWidth: 1.5,
    borderColor: '#2A2A35',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  productThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#2A2A35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 3 },
  productDesc: { fontSize: 12, color: '#666', marginBottom: 6, lineHeight: 17 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 16, fontWeight: '700', color: '#FF6B2B' },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FF6B2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 20, fontWeight: '300', lineHeight: 24 },
  avaliarBtn: {
    backgroundColor: '#FF6B2B22',
    borderWidth: 1.5,
    borderColor: '#FF6B2B',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  avaliarBtnText: { color: '#FF6B2B', fontWeight: '600', fontSize: 15 },
  avalCard: {
    backgroundColor: '#18181F',
    borderWidth: 1.5,
    borderColor: '#2A2A35',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  avalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avalAutor: { fontSize: 14, fontWeight: '600', color: '#fff' },
  avalNota: { fontSize: 13 },
  avalComent: { fontSize: 13, color: '#aaa', lineHeight: 18 },
  avalData: { fontSize: 11, color: '#555' },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#14141C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  label: { fontSize: 12, color: '#888', fontWeight: '500' },
  input: {
    backgroundColor: '#18181F',
    borderWidth: 1.5,
    borderColor: '#2A2A35',
    borderRadius: 12,
    padding: 13,
    fontSize: 14,
    color: '#fff',
  },
  notaRow: { flexDirection: 'row', gap: 8 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancel: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#2A2A35',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: { color: '#888', fontSize: 15, fontWeight: '600' },
  modalEnviar: {
    flex: 1,
    backgroundColor: '#FF6B2B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalEnviarText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});