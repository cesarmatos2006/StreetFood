import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
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
  borderFocus: 'rgba(245,158,11,0.5)',
  danger:      '#EF4444',
  success:     '#22C55E',
};

type TipoConta = 'cliente' | 'vendedor' | null;

// ─── Opção de tipo de conta ───────────────────────────────────────────────────
function OpcaoConta({
  icone, titulo, descricao, ativo, onPress,
}: {
  icone: string; titulo: string; descricao: string;
  ativo: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[s.opcao, ativo && s.opcaoAtiva]}
    >
      <Text style={s.opcaoIcone}>{icone}</Text>
      <View style={s.opcaoInfo}>
        <Text style={[s.opcaoTitulo, ativo && s.opcaoTituloAtivo]}>{titulo}</Text>
        <Text style={s.opcaoDesc}>{descricao}</Text>
      </View>
      <View style={[s.radio, ativo && s.radioAtivo]}>
        {ativo && <View style={s.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

// ─── Campo simples ────────────────────────────────────────────────────────────
function Campo({
  label, icone, value, onChange,
  secureTextEntry = false, keyboardType = 'default' as any, erro = '',
}) {
  const borda = useRef(new Animated.Value(0)).current;
  const corBorda = borda.interpolate({
    inputRange: [0, 1],
    outputRange: [erro ? C.danger : C.border, erro ? C.danger : C.borderFocus],
  });

  return (
    <View style={s.campoWrap}>
      <Text style={s.campoLabel}>{label}</Text>
      <Animated.View style={[s.campoRow, { borderColor: corBorda }]}>
        <Text style={s.campoIcone}>{icone}</Text>
        <TextInput
          style={s.campoInput}
          value={value}
          onChangeText={onChange}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          placeholderTextColor={C.textMuted}
          onFocus={() => Animated.timing(borda, { toValue: 1, duration: 200, useNativeDriver: false }).start()}
          onBlur={()  => Animated.timing(borda, { toValue: 0, duration: 200, useNativeDriver: false }).start()}
          selectionColor={C.amber}
        />
      </Animated.View>
      {!!erro && <Text style={s.campoErro}>{erro}</Text>}
    </View>
  );
}

// ─── Tela Principal ──────────────────────────────────────────────────────────
export default function Cadastro() {
  const router = useRouter();

  const [tipo,    setTipo]    = useState<TipoConta>(null);
  const [nome,    setNome]    = useState('');
  const [email,   setEmail]   = useState('');
  const [senha,   setSenha]   = useState('');
  const [loading, setLoading] = useState(false);
  const [erros,   setErros]   = useState<Record<string, string>>({});

  const opacity = useRef(new Animated.Value(0)).current;
  const slideY  = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideY,  { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Validação ──
  function validar() {
    const e: Record<string, string> = {};
    if (!nome.trim())                      e.nome  = 'Informe seu nome.';
    if (!email.trim())                     e.email = 'Informe seu e-mail.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido.';
    if (!senha)                            e.senha = 'Crie uma senha.';
    else if (senha.length < 6)            e.senha = 'Mínimo 6 caracteres.';
    if (!tipo)                             e.tipo  = 'Escolha o tipo de conta.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  // ── Cadastrar ──
  async function cadastrar() {
    if (!validar()) return;
    setLoading(true);

    try {
      // Troque pela sua URL real:
      const res = await fetch('http://192.168.15.110:3000/auth/register', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, tipo }),
      });
       const data = await res.json();
      if (!res.ok) throw new Error(data.message);
       await AsyncStorage.setItem('user', JSON.stringify(data.user));

      // Mock local:
      await new Promise(r => setTimeout(r, 800));
      await AsyncStorage.setItem('user', JSON.stringify({ nome, email, tipo }));

      // Roteamento correto: cliente → Home, vendedor → Publicar
      if (tipo === 'vendedor') {
        router.replace('/publicar');
      } else {
        router.replace('/');
      }
    } catch (err: any) {
      setErros({ geral: err.message || 'Erro ao criar conta. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.topBar} />

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
        <Animated.View style={[s.header, { opacity, transform: [{ translateY: slideY }] }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.voltarBtn}>
            <Text style={s.voltarText}>← Voltar</Text>
          </TouchableOpacity>
          <View style={s.logoRow}>
            <Text style={s.logoEmoji}>🍢</Text>
            <Text style={s.logoText}>
              STREET<Text style={s.logoAccent}>FOOD</Text>
            </Text>
          </View>
          <Text style={s.titulo}>Criar conta</Text>
          <Text style={s.subtitulo}>Rápido, gratuito e sem complicação</Text>
        </Animated.View>

        {/* Formulário */}
        <Animated.View style={[s.card, { opacity, transform: [{ translateY: slideY }] }]}>

          {!!erros.geral && (
            <View style={s.alertBox}>
              <Text style={s.alertText}>⚠️  {erros.geral}</Text>
            </View>
          )}

          <Campo label="Nome"   icone="👤" value={nome}  onChange={setNome}  erro={erros.nome} />
          <Campo label="E-mail" icone="✉️" value={email} onChange={setEmail} erro={erros.email} keyboardType="email-address" />
          <Campo label="Senha"  icone="🔒" value={senha} onChange={setSenha} erro={erros.senha} secureTextEntry />

          {/* Separador */}
          <View style={s.secaoRow}>
            <View style={s.secaoLine} />
            <Text style={s.secaoLabel}>Tipo de conta</Text>
            <View style={s.secaoLine} />
          </View>

          {!!erros.tipo && <Text style={[s.campoErro, { marginBottom: 12 }]}>{erros.tipo}</Text>}

          <OpcaoConta
            icone="🙋"
            titulo="Sou cliente"
            descricao="Quero encontrar vendedores e ver cardápios"
            ativo={tipo === 'cliente'}
            onPress={() => setTipo('cliente')}
          />

          <View style={{ height: 10 }} />

          <OpcaoConta
            icone="🍢"
            titulo="Sou vendedor"
            descricao="Quero cadastrar minha barraca e publicar produtos"
            ativo={tipo === 'vendedor'}
            onPress={() => setTipo('vendedor')}
          />

          <TouchableOpacity
            style={s.btnCadastrar}
            onPress={cadastrar}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#0D0D0D" />
              : <Text style={s.btnCadastrarText}>CRIAR CONTA</Text>
            }
          </TouchableOpacity>
        </Animated.View>

        {/* Já tem conta */}
        <Animated.View style={[s.rodape, { opacity }]}>
          <Text style={s.rodapeText}>Já tem conta?  </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={s.rodapeLink}>Entrar →</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: C.bg },
  topBar: { height: 3, backgroundColor: C.amber, opacity: 0.85 },
  scroll: {
    paddingTop: Platform.OS === 'ios' ? 56 : 32,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },

  /* Header */
  header:    { marginBottom: 24 },
  voltarBtn: { marginBottom: 20 },
  voltarText: { fontSize: 14, color: C.textSub },
  logoRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  logoEmoji: { fontSize: 26 },
  logoText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 18, fontWeight: '700', letterSpacing: 4, color: C.textPrimary,
  },
  logoAccent: { color: C.amber },
  titulo: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28, fontWeight: '700', color: C.textPrimary, marginBottom: 6,
  },
  subtitulo: { fontSize: 14, color: C.textSub },

  /* Card */
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  alertBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    padding: 12,
    marginBottom: 20,
  },
  alertText: { color: C.danger, fontSize: 13 },

  /* Campo */
  campoWrap: { marginBottom: 16 },
  campoLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    textTransform: 'uppercase', color: C.textMuted, marginBottom: 8,
  },
  campoRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surfaceHigh,
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
  },
  campoIcone:  { fontSize: 16, marginRight: 10 },
  campoInput:  { flex: 1, fontSize: 15, color: C.textPrimary },
  campoErro:   { marginTop: 6, fontSize: 12, color: C.danger },

  /* Seção tipo de conta */
  secaoRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginVertical: 20,
  },
  secaoLine: { flex: 1, height: 1, backgroundColor: C.border },
  secaoLabel: { fontSize: 11, color: C.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },

  /* Opção de conta */
  opcao: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 14,
    backgroundColor: C.surfaceHigh,
    borderWidth: 1.5, borderColor: C.border,
  },
  opcaoAtiva: {
    backgroundColor: C.amberDim,
    borderColor: C.amber,
  },
  opcaoIcone: { fontSize: 28 },
  opcaoInfo:  { flex: 1 },
  opcaoTitulo: {
    fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 2,
  },
  opcaoTituloAtivo: { color: C.amber },
  opcaoDesc: { fontSize: 12, color: C.textMuted, lineHeight: 16 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioAtivo:  { borderColor: C.amber },
  radioDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: C.amber,
  },

  /* Botão cadastrar */
  btnCadastrar: {
    backgroundColor: C.amber,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 24,
    shadowColor: C.amber,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnCadastrarText: {
    fontSize: 15, fontWeight: '800',
    letterSpacing: 2.5, color: '#0D0D0D',
  },

  /* Rodapé */
  rodape: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  rodapeText: { fontSize: 14, color: C.textMuted },
  rodapeLink: { fontSize: 14, color: C.amber, fontWeight: '700' },
});
