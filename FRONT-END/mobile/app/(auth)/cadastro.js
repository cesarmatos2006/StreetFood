import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { api } from '../../api';
import { useAuth } from '../../hooks/useAuth';

// ─── Etapa 0: escolha do tipo ────────────────────────────────
function EscolhaTipo({ onEscolher }) {
  return (
    <View style={s.tipoContainer}>
      <View style={s.logoRing}>
        <Text style={{ fontSize: 36 }}>🍔</Text>
      </View>
      <Text style={s.tipoTitle}>Criar conta</Text>
      <Text style={s.tipoSub}>Como você quer usar o StreetFood?</Text>

      <TouchableOpacity style={s.tipoCard} onPress={() => onEscolher('cliente')}>
        <Text style={s.tipoEmoji}>🗺️</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.tipoCardTitle}>Sou cliente</Text>
          <Text style={s.tipoCardDesc}>
            Quero encontrar barracas e trailers perto de mim
          </Text>
        </View>
        <Text style={s.tipoChevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.tipoCard, s.tipoCardVendedor]}
        onPress={() => onEscolher('vendedor')}
      >
        <Text style={s.tipoEmoji}>🏪</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.tipoCardTitle}>Sou vendedor</Text>
          <Text style={s.tipoCardDesc}>
            Quero cadastrar minha barraca ou trailer no mapa
          </Text>
        </View>
        <Text style={s.tipoChevron}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Formulário de cliente ───────────────────────────────────
function FormCliente({ onVoltar, onConcluir }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  // Clientes não têm backend próprio por enquanto —
  // criamos a conta localmente e salvamos como tipo 'cliente'.
  // Quando quiser persistir clientes, basta criar POST /auth/cadastro-cliente no backend.
  const handleCadastro = () => {
    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    // Simula criação local do cliente
    setTimeout(() => {
      setLoading(false);
      onConcluir({ nome, email, tipo: 'cliente' });
    }, 600);
  };

  return (
    <ScrollView contentContainerStyle={s.formContainer} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={s.back} onPress={onVoltar}>
        <Text style={s.backText}>← Voltar</Text>
      </TouchableOpacity>

      <View style={s.tipoBadge}>
        <Text style={s.tipoBadgeText}>🗺️  Conta de cliente</Text>
      </View>

      <Text style={s.title}>Seus dados</Text>
      <Text style={s.sub}>Crie sua conta para salvar favoritos e avaliar vendedores</Text>

      <Text style={s.label}>Nome completo</Text>
      <TextInput
        style={s.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex: Maria Silva"
        placeholderTextColor="#555"
      />

      <Text style={s.label}>E-mail</Text>
      <TextInput
        style={s.input}
        value={email}
        onChangeText={setEmail}
        placeholder="seu@email.com"
        placeholderTextColor="#555"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={s.label}>Senha</Text>
      <TextInput
        style={s.input}
        value={senha}
        onChangeText={setSenha}
        placeholder="Mínimo 6 caracteres"
        placeholderTextColor="#555"
        secureTextEntry
      />

      <TouchableOpacity style={s.btnPrimary} onPress={handleCadastro} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.btnText}>Criar conta</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Formulário de vendedor ──────────────────────────────────
function FormVendedor({ onVoltar, onConcluir }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [categoriaId, setCategoriaId] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  useEffect(() => {
    api.getCategorias().then(setCategorias).catch(() => {});
  }, []);

  const pegarLocalizacao = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da sua localização para colocar sua barraca no mapa.');
        return;
      }
      const { coords: c } = await Location.getCurrentPositionAsync();
      setCoords({ latitude: c.latitude, longitude: c.longitude });
    } catch {
      Alert.alert('Erro', 'Não foi possível obter localização.');
    } finally {
      setLocLoading(false);
    }
  };

  const handleCadastro = async () => {
    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Preencha nome, e-mail e senha.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (!coords) {
      Alert.alert('Atenção', 'Adicione sua localização para aparecer no mapa.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.cadastrarVendedor({
        nome,
        email,
        senha,
        categoria_id: categoriaId,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      if (res.id) {
        const loginRes = await api.login(email, senha);
        if (loginRes.user) {
          onConcluir(loginRes.user);
        } else {
          Alert.alert('Erro', loginRes.mensagem || 'Não foi possível fazer login automático.');
        }
      } else {
        Alert.alert('Erro', res.mensagem || 'Não foi possível cadastrar.');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.formContainer} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={s.back} onPress={onVoltar}>
        <Text style={s.backText}>← Voltar</Text>
      </TouchableOpacity>

      <View style={[s.tipoBadge, s.tipoBadgeVendedor]}>
        <Text style={[s.tipoBadgeText, s.tipoBadgeTextVendedor]}>🏪  Conta de vendedor</Text>
      </View>

      <Text style={s.title}>Sua barraca</Text>
      <Text style={s.sub}>Preencha os dados para aparecer no mapa dos clientes</Text>

      <Text style={s.label}>Nome da barraca / trailer *</Text>
      <TextInput
        style={s.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex: Trailer do Zé"
        placeholderTextColor="#555"
      />

      <Text style={s.label}>E-mail *</Text>
      <TextInput
        style={s.input}
        value={email}
        onChangeText={setEmail}
        placeholder="seu@email.com"
        placeholderTextColor="#555"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={s.label}>Senha *</Text>
      <TextInput
        style={s.input}
        value={senha}
        onChangeText={setSenha}
        placeholder="Mínimo 6 caracteres"
        placeholderTextColor="#555"
        secureTextEntry
      />

      <Text style={s.label}>Categoria</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll}>
        {categorias.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[s.catChip, categoriaId === c.id && s.catChipActive]}
            onPress={() => setCategoriaId(c.id)}
          >
            <Text style={[s.catText, categoriaId === c.id && s.catTextActive]}>
              {c.nome}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={s.label}>Localização *</Text>
      <TouchableOpacity style={s.locBtn} onPress={pegarLocalizacao} disabled={locLoading}>
        {locLoading
          ? <ActivityIndicator color="#FF6B2B" />
          : <Text style={s.locBtnText}>
              {coords
                ? `📍 ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
                : '📍 Usar minha localização atual'}
            </Text>}
      </TouchableOpacity>

      <TouchableOpacity style={s.btnPrimary} onPress={handleCadastro} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.btnText}>Criar conta de vendedor</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Tela principal que orquestra os passos ──────────────────
export default function Cadastro() {
  const router = useRouter();
  const { login, entrarComoCliente } = useAuth();
  const [tipo, setTipo] = useState(null); // null | 'cliente' | 'vendedor'

  const handleEscolher = (t) => setTipo(t);
  const handleVoltar = () => setTipo(null);

  const handleConcluirCliente = (dadosCliente) => {
    // Cliente: salva localmente via contexto
    entrarComoCliente(dadosCliente);
    router.replace('/home');
  };

  const handleConcluirVendedor = (userData) => {
    login(userData);
    router.replace('/home');
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {tipo === null && (
          <ScrollView contentContainerStyle={s.tipoScroll}>
            <TouchableOpacity style={s.back} onPress={() => router.back()}>
              <Text style={s.backText}>← Voltar</Text>
            </TouchableOpacity>
            <EscolhaTipo onEscolher={handleEscolher} />
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={s.loginText}>
                Já tem conta? <Text style={s.link}>Entrar</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {tipo === 'cliente' && (
          <FormCliente onVoltar={handleVoltar} onConcluir={handleConcluirCliente} />
        )}

        {tipo === 'vendedor' && (
          <FormVendedor onVoltar={handleVoltar} onConcluir={handleConcluirVendedor} />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0E0E12' },

  // ── escolha de tipo
  tipoScroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  tipoContainer: { alignItems: 'center', gap: 14, paddingTop: 8 },
  logoRing: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FF6B2B',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  tipoTitle: { fontSize: 26, fontWeight: '700', color: '#fff' },
  tipoSub: { fontSize: 14, color: '#666', marginBottom: 8, textAlign: 'center' },
  tipoCard: {
    width: '100%',
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#18181F',
    borderWidth: 1.5, borderColor: '#2A2A35',
    borderRadius: 16, padding: 18,
  },
  tipoCardVendedor: { borderColor: '#FF6B2B44' },
  tipoEmoji: { fontSize: 28 },
  tipoCardTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 3 },
  tipoCardDesc: { fontSize: 13, color: '#888', lineHeight: 18 },
  tipoChevron: { fontSize: 22, color: '#555' },

  // ── formulários
  formContainer: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, gap: 12 },
  back: { marginBottom: 4 },
  backText: { color: '#888', fontSize: 15 },
  tipoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#18181F',
    borderWidth: 1.5, borderColor: '#2A2A35',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
    marginBottom: 4,
  },
  tipoBadgeVendedor: { borderColor: '#FF6B2B44', backgroundColor: '#FF6B2B11' },
  tipoBadgeText: { fontSize: 13, color: '#888', fontWeight: '500' },
  tipoBadgeTextVendedor: { color: '#FF8C50' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  sub: { fontSize: 14, color: '#666', marginBottom: 8, lineHeight: 20 },
  label: { fontSize: 12, color: '#888', fontWeight: '500' },
  input: {
    backgroundColor: '#18181F',
    borderWidth: 1.5, borderColor: '#2A2A35',
    borderRadius: 12, padding: 14,
    fontSize: 15, color: '#fff',
  },
  catScroll: { marginVertical: 2 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#2A2A35', marginRight: 8,
  },
  catChipActive: { backgroundColor: '#FF6B2B', borderColor: '#FF6B2B' },
  catText: { color: '#888', fontSize: 13, fontWeight: '600' },
  catTextActive: { color: '#fff' },
  locBtn: {
    backgroundColor: '#18181F',
    borderWidth: 1.5, borderColor: '#2A2A35',
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  locBtnText: { color: '#FF6B2B', fontSize: 14, fontWeight: '500' },
  btnPrimary: {
    backgroundColor: '#FF6B2B',
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loginText: { textAlign: 'center', fontSize: 14, color: '#666', marginTop: 20 },
  link: { color: '#FF6B2B', fontWeight: '600' },
});