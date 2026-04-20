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

// ─── Design Tokens (mesmo padrão do projeto) ─────────────────────────────────
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
};

// ─── Campo com animação de foco ───────────────────────────────────────────────
function Campo({
  label, icone, value, onChange, secureTextEntry = false,
  keyboardType = 'default' as any, erro = '',
  showToggle = false, onToggle = () => {},
}) {
  const borda = useRef(new Animated.Value(0)).current;

  const focar = () =>
    Animated.timing(borda, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  const desfocar = () =>
    Animated.timing(borda, { toValue: 0, duration: 200, useNativeDriver: false }).start();

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
          onFocus={focar}
          onBlur={desfocar}
          selectionColor={C.amber}
        />
        {showToggle && (
          <TouchableOpacity onPress={onToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={s.campoToggle}>{secureTextEntry ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      {!!erro && <Text style={s.campoErro}>{erro}</Text>}
    </View>
  );
}

// ─── Tela Principal ──────────────────────────────────────────────────────────
export default function Login() {
  const router = useRouter();

  const [email,    setEmail]    = useState('');
  const [senha,    setSenha]    = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [erros,    setErros]    = useState<Record<string, string>>({});

  const slideY  = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const shakeX  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideY,  { toValue: 0, duration: 550, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 550, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Validação ──
  function validar() {
    const e: Record<string, string> = {};
    if (!email.trim())                      e.email = 'Informe seu e-mail.';
    else if (!/\S+@\S+\.\S+/.test(email))  e.email = 'E-mail inválido.';
    if (!senha)                             e.senha = 'Informe sua senha.';
    else if (senha.length < 6)             e.senha = 'Mínimo 6 caracteres.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  // ── Shake no erro ──
  function shake() {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 10,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 6,   duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0,   duration: 55, useNativeDriver: true }),
    ]).start();
  }

  // ── Login ──
  async function entrar() {
    if (!validar()) { shake(); return; }
    setLoading(true);

    try {
      // Troque pela sua URL real:
       const res = await fetch('http://192.168.15.110:3000/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: senha }),
       });
       const data = await res.json();
       if (!res.ok) throw new Error(data.message);
       await AsyncStorage.setItem('user', JSON.stringify(data.user));

      // Mock local enquanto o backend não está pronto:
      await new Promise(r => setTimeout(r, 800));
      await AsyncStorage.setItem('user', JSON.stringify({ nome: 'Usuário', email }));

      router.replace('/');                   // ✅ vai para a Home, não para /publicar
    } catch (err: any) {
      setErros({ geral: err.message || 'E-mail ou senha incorretos.' });
      shake();
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

      {/* Faixa âmbar no topo */}
      <View style={s.topBar} />

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
        <Animated.View style={[s.header, { opacity, transform: [{ translateY: slideY }] }]}>
          <View style={s.logoRow}>
            <Text style={s.logoEmoji}>🍢</Text>
            <Text style={s.logoText}>
              STREET<Text style={s.logoAccent}>FOOD</Text>
            </Text>
          </View>
          <Text style={s.titulo}>Bem-vindo de volta</Text>
          <Text style={s.subtitulo}>Entre para encontrar vendedores perto de você</Text>
        </Animated.View>

        {/* Formulário */}
        <Animated.View style={[s.card, { opacity, transform: [{ translateX: shakeX }, { translateY: slideY }] }]}>

          {!!erros.geral && (
            <View style={s.alertBox}>
              <Text style={s.alertText}>⚠️  {erros.geral}</Text>
            </View>
          )}

          <Campo
            label="E-mail"
            icone="✉️"
            value={email}
            onChange={setEmail}
            keyboardType="email-address"
            erro={erros.email}
          />

          <Campo
            label="Senha"
            icone="🔒"
            value={senha}
            onChange={setSenha}
            secureTextEntry={!showPass}
            erro={erros.senha}
            showToggle
            onToggle={() => setShowPass(p => !p)}
          />

          <TouchableOpacity style={s.esqueciRow}>
            <Text style={s.esqueciText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnEntrar}
            onPress={entrar}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#0D0D0D" />
              : <Text style={s.btnEntrarText}>ENTRAR</Text>
            }
          </TouchableOpacity>
        </Animated.View>

        {/* Rodapé */}
        <Animated.View style={[s.rodape, { opacity }]}>
          <Text style={s.rodapeText}>Não tem conta?  </Text>
          <TouchableOpacity onPress={() => router.push('/cadastro')}>
            <Text style={s.rodapeLink}>Criar conta grátis →</Text>
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
    paddingTop:    Platform.OS === 'ios' ? 60 : 36,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },

  /* Header */
  header:    { marginBottom: 28 },
  logoRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  logoEmoji: { fontSize: 28 },
  logoText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 20, fontWeight: '700', letterSpacing: 4, color: C.textPrimary,
  },
  logoAccent: { color: C.amber },
  titulo: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 30, fontWeight: '700', color: C.textPrimary,
    letterSpacing: 0.2, marginBottom: 8,
  },
  subtitulo: { fontSize: 14, color: C.textSub, lineHeight: 20 },

  /* Card do form */
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
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
  campoWrap:   { marginBottom: 18 },
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
  campoToggle: { fontSize: 16, marginLeft: 8 },
  campoErro:   { marginTop: 6, fontSize: 12, color: C.danger },

  /* Esqueci */
  esqueciRow: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 22 },
  esqueciText: { fontSize: 12, color: C.amber, fontWeight: '600' },

  /* Botão entrar */
  btnEntrar: {
    backgroundColor: C.amber,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowColor: C.amber,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnEntrarText: {
    fontSize: 15, fontWeight: '800',
    letterSpacing: 2.5, color: '#0D0D0D',
  },

  /* Rodapé */
  rodape: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  rodapeText: { fontSize: 14, color: C.textMuted },
  rodapeLink: { fontSize: 14, color: C.amber, fontWeight: '700' },
});
