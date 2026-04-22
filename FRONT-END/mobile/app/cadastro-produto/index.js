import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../api';
import { useAuth } from '../../hooks/useAuth.js';

export default function CadastroProduto() {
  const router = useRouter();
  const { user } = useAuth();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSalvar = async () => {
    if (!nome || !preco) {
      Alert.alert('Atenção', 'Nome e preço são obrigatórios.');
      return;
    }
    if (!user?.id) {
      Alert.alert('Atenção', 'Você precisa estar logado.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.cadastrarProduto({
        nome,
        descricao,
        preco: parseFloat(preco.replace(',', '.')),
        vendedor_id: user.id,
      });
      if (res.id) {
        Alert.alert('Sucesso!', 'Produto cadastrado.', [
          { text: 'Cadastrar outro', onPress: () => { setNome(''); setDescricao(''); setPreco(''); } },
          { text: 'Voltar', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Erro', res.mensagem ?? 'Não foi possível cadastrar.');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={s.back} onPress={() => router.back()}>
            <Text style={s.backText}>← Voltar</Text>
          </TouchableOpacity>

          <Text style={s.title}>Novo produto</Text>
          <Text style={s.sub}>Adicione um item ao seu cardápio</Text>

          <Text style={s.label}>Nome do produto *</Text>
          <TextInput
            style={s.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Taco de Frango"
            placeholderTextColor="#555"
          />

          <Text style={s.label}>Descrição</Text>
          <TextInput
            style={[s.input, { height: 90, textAlignVertical: 'top' }]}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Ingredientes, tamanho, observações..."
            placeholderTextColor="#555"
            multiline
          />

          <Text style={s.label}>Preço (R$) *</Text>
          <TextInput
            style={s.input}
            value={preco}
            onChangeText={setPreco}
            placeholder="Ex: 14,90"
            placeholderTextColor="#555"
            keyboardType="decimal-pad"
          />

          {/* Preview */}
          {(nome || preco) && (
            <View style={s.preview}>
              <Text style={s.previewLabel}>Prévia</Text>
              <View style={s.previewCard}>
                <View style={s.previewThumb}>
                  <Text style={{ fontSize: 24 }}>🍽️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.previewName}>{nome || 'Nome do produto'}</Text>
                  {descricao ? (
                    <Text style={s.previewDesc} numberOfLines={2}>{descricao}</Text>
                  ) : null}
                  <Text style={s.previewPrice}>
                    R$ {preco ? Number(preco.replace(',', '.')).toFixed(2) : '0,00'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity style={s.btnPrimary} onPress={handleSalvar} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Salvar produto</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0E0E12' },
  container: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, gap: 12 },
  back: { marginBottom: 8 },
  backText: { color: '#888', fontSize: 15 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  sub: { fontSize: 14, color: '#666', marginBottom: 8 },
  label: { fontSize: 12, color: '#888', fontWeight: '500' },
  input: {
    backgroundColor: '#18181F',
    borderWidth: 1.5,
    borderColor: '#2A2A35',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#fff',
  },
  preview: { gap: 8 },
  previewLabel: { fontSize: 12, color: '#888', fontWeight: '500' },
  previewCard: {
    backgroundColor: '#18181F',
    borderWidth: 1.5,
    borderColor: '#FF6B2B44',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  previewThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#2A2A35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 3 },
  previewDesc: { fontSize: 12, color: '#666', marginBottom: 4 },
  previewPrice: { fontSize: 16, fontWeight: '700', color: '#FF6B2B' },
  btnPrimary: {
    backgroundColor: '#FF6B2B',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});