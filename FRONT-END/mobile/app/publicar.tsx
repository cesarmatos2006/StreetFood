import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  Platform,
  Animated,
  KeyboardAvoidingView,
  Alert,
  ScrollView,
} from 'react-native';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
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

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Produto = {
  id: string;
  nome: string;
  preco: string;
  descricao: string;
  emoji: string;
};

const EMOJIS = ['🍔','🥟','🍢','🍬','🫓','🍗','🥩','🍕','🌮','🍜','🥤','🍩'];

// ─── Campo do formulário ──────────────────────────────────────────────────────
function Campo({
  label, icone, value, onChange, placeholder = '',
  keyboardType = 'default' as any, multiline = false, erro = '',
}) {
  const borda = useRef(new Animated.Value(0)).current;
  const corBorda = borda.interpolate({
    inputRange: [0, 1],
    outputRange: [erro ? C.danger : C.border, erro ? C.danger : C.borderFocus],
  });

  return (
    <View style={s.campoWrap}>
      <Text style={s.campoLabel}>{label}</Text>
      <Animated.View style={[s.campoRow, multiline && s.campoMultiline, { borderColor: corBorda }]}>
        <Text style={s.campoIcone}>{icone}</Text>
        <TextInput
          style={[s.campoInput, multiline && { height: 70, textAlignVertical: 'top' }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={C.textMuted}
          keyboardType={keyboardType}
          multiline={multiline}
          onFocus={() => Animated.timing(borda, { toValue: 1, duration: 200, useNativeDriver: false }).start()}
          onBlur={()  => Animated.timing(borda, { toValue: 0, duration: 200, useNativeDriver: false }).start()}
          selectionColor={C.amber}
        />
      </Animated.View>
      {!!erro && <Text style={s.campoErro}>{erro}</Text>}
    </View>
  );
}

// ─── Card de produto publicado ────────────────────────────────────────────────
function ProdutoCard({ item, onRemover }: { item: Produto; onRemover: () => void }) {
  return (
    <View style={s.prodCard}>
      <Text style={s.prodEmoji}>{item.emoji}</Text>
      <View style={s.prodInfo}>
        <Text style={s.prodNome}>{item.nome}</Text>
        {!!item.descricao && (
          <Text style={s.prodDesc} numberOfLines={1}>{item.descricao}</Text>
        )}
        <Text style={s.prodPreco}>R$ {parseFloat(item.preco).toFixed(2)}</Text>
      </View>
      <TouchableOpacity onPress={onRemover} style={s.removerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={s.removerIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Tela Principal ──────────────────────────────────────────────────────────
export default function Publicar() {
  const router = useRouter();

  const [nome,      setNome]      = useState('');
  const [preco,     setPreco]     = useState('');
  const [descricao, setDescricao] = useState('');
  const [emojiSel,  setEmojiSel]  = useState('🍔');
  const [produtos,  setProdutos]  = useState<Produto[]>([]);
  const [erros,     setErros]     = useState<Record<string, string>>({});
  const [userName,  setUserName]  = useState('');
  const [showForm,  setShowForm]  = useState(false);

  const formHeight = useRef(new Animated.Value(0)).current;
  const headerO    = useRef(new Animated.Value(0)).current;
  const headerY    = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    AsyncStorage.getItem('user').then(raw => {
      if (raw) setUserName(JSON.parse(raw).nome ?? '');
    }).catch(() => {});

    Animated.parallel([
      Animated.timing(headerO, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(headerY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  function toggleForm() {
    const para = showForm ? 0 : 1;
    setShowForm(!showForm);
    Animated.timing(formHeight, { toValue: para, duration: 300, useNativeDriver: false }).start();
  }

  function validar() {
    const e: Record<string, string> = {};
    if (!nome.trim())    e.nome  = 'Informe o nome do produto.';
    if (!preco.trim())   e.preco = 'Informe o preço.';
    else if (isNaN(parseFloat(preco.replace(',', '.')))) e.preco = 'Preço inválido.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function publicar() {
    if (!validar()) return;

    const novo: Produto = {
      id:       Date.now().toString(),
      nome:     nome.trim(),
      preco:    preco.replace(',', '.'),
      descricao: descricao.trim(),
      emoji:    emojiSel,
    };

    setProdutos(p => [novo, ...p]);
    setNome('');
    setPreco('');
    setDescricao('');
    setEmojiSel('🍔');
    setErros({});
    setShowForm(false);
    Animated.timing(formHeight, { toValue: 0, duration: 300, useNativeDriver: false }).start();
  }

  function remover(id: string) {
    Alert.alert('Remover produto', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover',  style: 'destructive', onPress: () => setProdutos(p => p.filter(x => x.id !== id)) },
    ]);
  }

  async function sair() {
    await AsyncStorage.removeItem('user');
    router.replace('/login');
  }

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.topBar} />

      <FlatList
        data={produtos}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        keyboardShouldPersistTaps="handled"

        ListHeaderComponent={
          <Animated.View style={{ opacity: headerO, transform: [{ translateY: headerY }] }}>

            {/* Cabeçalho */}
            <View style={s.header}>
              <View>
                <Text style={s.greetSub}>
                  {userName ? `Olá, ${userName}! 👋` : 'Área do vendedor 👋'}
                </Text>
                <Text style={s.greetTitle}>Sua barraca</Text>
              </View>
              <TouchableOpacity onPress={sair} style={s.sairBtn}>
                <Text style={s.sairIcon}>⏏</Text>
              </TouchableOpacity>
            </View>

            {/* Stats rápidos */}
            <View style={s.statsRow}>
              <View style={s.statCard}>
                <Text style={s.statNum}>{produtos.length}</Text>
                <Text style={s.statLabel}>Produtos</Text>
              </View>
              <View style={s.statCard}>
                <Text style={[s.statNum, { color: C.success }]}>●</Text>
                <Text style={s.statLabel}>Aberta</Text>
              </View>
              <View style={s.statCard}>
                <Text style={s.statNum}>0</Text>
                <Text style={s.statLabel}>Pedidos hoje</Text>
              </View>
            </View>

            {/* Botão abrir formulário */}
            <TouchableOpacity
              onPress={toggleForm}
              style={[s.addBtn, showForm && s.addBtnAberto]}
              activeOpacity={0.85}
            >
              <Text style={s.addBtnText}>
                {showForm ? '✕  Cancelar' : '+ Adicionar produto'}
              </Text>
            </TouchableOpacity>

            {/* Formulário animado */}
            <Animated.View style={[
              s.formCard,
              {
                maxHeight: formHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 600] }),
                opacity: formHeight,
                overflow: 'hidden',
              }
            ]}>
              {/* Seletor de emoji */}
              <Text style={s.emojiLabel}>ÍCONE DO PRODUTO</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={s.emojiRow}>
                  {EMOJIS.map(e => (
                    <TouchableOpacity
                      key={e}
                      onPress={() => setEmojiSel(e)}
                      style={[s.emojiOpcao, emojiSel === e && s.emojiOpcaoAtiva]}
                    >
                      <Text style={s.emojiItem}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Campo
                label="Nome do produto"
                icone={emojiSel}
                value={nome}
                onChange={setNome}
                placeholder="Ex: X-Burguer Clássico"
                erro={erros.nome}
              />
              <Campo
                label="Preço (R$)"
                icone="💰"
                value={preco}
                onChange={setPreco}
                placeholder="Ex: 12.90"
                keyboardType="decimal-pad"
                erro={erros.preco}
              />
              <Campo
                label="Descrição (opcional)"
                icone="📝"
                value={descricao}
                onChange={setDescricao}
                placeholder="Ingredientes, tamanho, detalhe..."
                multiline
              />

              <TouchableOpacity
                style={s.publicarBtn}
                onPress={publicar}
                activeOpacity={0.85}
              >
                <Text style={s.publicarBtnText}>PUBLICAR PRODUTO</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Título lista */}
            {produtos.length > 0 && (
              <View style={s.secaoRow}>
                <Text style={s.secaoTitulo}>Seus produtos</Text>
                <Text style={s.secaoCount}>{produtos.length} publicado{produtos.length !== 1 ? 's' : ''}</Text>
              </View>
            )}
          </Animated.View>
        }

        renderItem={({ item }) => (
          <ProdutoCard item={item} onRemover={() => remover(item.id)} />
        )}

        ListEmptyComponent={
          !showForm ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyEmoji}>📦</Text>
              <Text style={s.emptyText}>Nenhum produto ainda</Text>
              <Text style={s.emptySub}>Toque em "+ Adicionar produto" para começar</Text>
            </View>
          ) : null
        }
      />
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  topBar:  { height: 3, backgroundColor: C.amber, opacity: 0.85 },
  listContent: { paddingBottom: 40 },

  /* Header */
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 28,
    paddingBottom: 20,
  },
  greetSub: { fontSize: 13, color: C.textMuted, marginBottom: 4 },
  greetTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28, fontWeight: '700', color: C.textPrimary,
  },
  sairBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.surfaceHigh,
    borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 6,
  },
  sairIcon: { fontSize: 16, color: C.textMuted },

  /* Stats */
  statsRow: {
    flexDirection: 'row', gap: 10,
    marginHorizontal: 20, marginBottom: 20,
  },
  statCard: {
    flex: 1, backgroundColor: C.surface,
    borderRadius: 14, borderWidth: 1, borderColor: C.border,
    padding: 14, alignItems: 'center', gap: 4,
  },
  statNum:   { fontSize: 22, fontWeight: '800', color: C.textPrimary },
  statLabel: { fontSize: 11, color: C.textMuted, letterSpacing: 0.3 },

  /* Botão adicionar */
  addBtn: {
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: C.amber,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: C.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  addBtnAberto: {
    backgroundColor: C.surfaceHigh,
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: C.border,
  },
  addBtnText: {
    fontSize: 15, fontWeight: '800',
    letterSpacing: 1.5, color: '#0D0D0D',
  },

  /* Formulário */
  formCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  emojiLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    color: C.textMuted, textTransform: 'uppercase', marginBottom: 10,
  },
  emojiRow: { flexDirection: 'row', gap: 8 },
  emojiOpcao: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: C.surfaceHigh,
    borderWidth: 1.5, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  emojiOpcaoAtiva: { borderColor: C.amber, backgroundColor: C.amberDim },
  emojiItem: { fontSize: 22 },

  /* Campo */
  campoWrap: { marginBottom: 14 },
  campoLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    textTransform: 'uppercase', color: C.textMuted, marginBottom: 8,
  },
  campoRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surfaceHigh,
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 4,
  },
  campoMultiline: { alignItems: 'flex-start', paddingVertical: 12 },
  campoIcone:  { fontSize: 16, marginRight: 10 },
  campoInput:  { flex: 1, fontSize: 15, color: C.textPrimary },
  campoErro:   { marginTop: 5, fontSize: 12, color: C.danger },

  /* Botão publicar */
  publicarBtn: {
    backgroundColor: C.amber,
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginTop: 8,
    shadowColor: C.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10,
    elevation: 6,
  },
  publicarBtnText: {
    fontSize: 14, fontWeight: '800',
    letterSpacing: 2, color: '#0D0D0D',
  },

  /* Seção lista */
  secaoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 12,
  },
  secaoTitulo: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 17, fontWeight: '700', color: C.textPrimary,
  },
  secaoCount: { fontSize: 12, color: C.textMuted },

  /* Card produto publicado */
  prodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: C.surface,
    borderRadius: 16, borderWidth: 1, borderColor: C.border,
    padding: 14,
  },
  prodEmoji: { fontSize: 28 },
  prodInfo:  { flex: 1 },
  prodNome:  { fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 2 },
  prodDesc:  { fontSize: 12, color: C.textMuted, marginBottom: 4 },
  prodPreco: { fontSize: 14, fontWeight: '800', color: C.amber },
  removerBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  removerIcon: { fontSize: 12, color: C.danger, fontWeight: '700' },

  /* Vazio */
  emptyWrap: { alignItems: 'center', paddingTop: 50, gap: 10 },
  emptyEmoji: { fontSize: 44 },
  emptyText:  { fontSize: 15, color: C.textSub, fontWeight: '600' },
  emptySub:   { fontSize: 13, color: C.textMuted, textAlign: 'center', paddingHorizontal: 40 },
});
