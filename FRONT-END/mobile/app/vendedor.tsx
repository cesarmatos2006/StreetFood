import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useEffect, useState } from 'react';

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
type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  emoji: string;
  popular?: boolean;
};

// ─── Mock de produtos por tipo de vendedor ────────────────────────────────────
const PRODUTOS_MOCK: Record<string, Produto[]> = {
  'Hambúrguer': [
    { id: 1, nome: 'X-Burguer Clássico',  descricao: 'Pão, hambúrguer 180g, queijo, alface e tomate',  preco: 18.90, emoji: '🍔', popular: true },
    { id: 2, nome: 'X-Bacon Duplo',       descricao: 'Dois hambúrgueres, bacon crocante e cheddar',     preco: 26.50, emoji: '🍔' },
    { id: 3, nome: 'X-Frango',            descricao: 'Filé de frango grelhado com maionese temperada',  preco: 16.00, emoji: '🍗' },
    { id: 4, nome: 'Batata Frita G',      descricao: 'Porção grande crocante com molho especial',       preco: 12.00, emoji: '🍟', popular: true },
    { id: 5, nome: 'Milk Shake',          descricao: 'Chocolate, morango ou baunilha 400ml',            preco: 14.00, emoji: '🥤' },
  ],
  'Pastel': [
    { id: 1, nome: 'Pastel de Carne',     descricao: 'Massa crocante com carne moída temperada',        preco: 8.00,  emoji: '🥟', popular: true },
    { id: 2, nome: 'Pastel de Queijo',    descricao: 'Queijo mussarela derretido por dentro',           preco: 7.50,  emoji: '🧀' },
    { id: 3, nome: 'Pastel de Frango',    descricao: 'Frango desfiado com catupiry',                    preco: 9.00,  emoji: '🥟', popular: true },
    { id: 4, nome: 'Caldo de Cana',       descricao: 'Gelado, 500ml. Combinação perfeita',             preco: 6.00,  emoji: '🥤' },
  ],
  'Doces': [
    { id: 1, nome: 'Brigadeiro Gourmet',  descricao: 'Chocolate belga com granulado artesanal',         preco: 5.00,  emoji: '🍫', popular: true },
    { id: 2, nome: 'Beijinho de Coco',    descricao: 'Coco fresco ralado com leite condensado',         preco: 4.50,  emoji: '🥥' },
    { id: 3, nome: 'Churros com Doce',    descricao: 'Massa frita com recheio de doce de leite',       preco: 10.00, emoji: '🍩', popular: true },
    { id: 4, nome: 'Picolé Artesanal',    descricao: 'Frutas frescas. Pergunte os sabores do dia',     preco: 7.00,  emoji: '🍦' },
  ],
  'Espeto': [
    { id: 1, nome: 'Espeto de Frango',    descricao: 'Temperado na hora, grelhado no carvão',           preco: 12.00, emoji: '🍢', popular: true },
    { id: 2, nome: 'Espeto de Carne',     descricao: 'Picanha ou contrafilé, ao ponto',                preco: 16.00, emoji: '🥩' },
    { id: 3, nome: 'Espeto Misto',        descricao: 'Carne, frango e linguiça no mesmo espeto',        preco: 18.00, emoji: '🍢', popular: true },
  ],
  'Tapioca': [
    { id: 1, nome: 'Tapioca de Coco',     descricao: 'Goma fresca com coco e leite condensado',         preco: 11.00, emoji: '🫓', popular: true },
    { id: 2, nome: 'Tapioca de Frango',   descricao: 'Frango desfiado com catupiry e ervas',            preco: 14.00, emoji: '🫓' },
    { id: 3, nome: 'Tapioca de Banana',   descricao: 'Banana com canela e mel',                         preco: 10.00, emoji: '🍌', popular: true },
  ],
};

const PRODUTOS_PADRAO: Produto[] = [
  { id: 1, nome: 'Produto do dia', descricao: 'Pergunte ao vendedor', preco: 10.00, emoji: '🍽️', popular: true },
];

// ─── Estrelas ─────────────────────────────────────────────────────────────────
function Stars({ value }: { value: number }) {
  return (
    <Text style={{ fontSize: 11, color: C.amber }}>
      {'★'.repeat(Math.floor(value))}{'☆'.repeat(5 - Math.floor(value))}
    </Text>
  );
}

// ─── Card de produto ──────────────────────────────────────────────────────────
function ProdutoCard({ item, onAdd }: { item: Produto; onAdd: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [adicionado, setAdicionado] = useState(false);

  function adicionar() {
    setAdicionado(true);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.06, duration: 120, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
    onAdd();
    setTimeout(() => setAdicionado(false), 1500);
  }

  return (
    <Animated.View style={[s.produto, { transform: [{ scale }] }]}>
      <View style={s.produtoAvatar}>
        <Text style={s.produtoEmoji}>{item.emoji}</Text>
        {item.popular && (
          <View style={s.popularBadge}>
            <Text style={s.popularText}>🔥</Text>
          </View>
        )}
      </View>

      <View style={s.produtoInfo}>
        <Text style={s.produtoNome}>{item.nome}</Text>
        <Text style={s.produtoDesc} numberOfLines={2}>{item.descricao}</Text>
        <Text style={s.produtoPreco}>R$ {item.preco.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        onPress={adicionar}
        style={[s.addBtn, adicionado && s.addBtnOk]}
        activeOpacity={0.85}
      >
        <Text style={s.addBtnText}>{adicionado ? '✓' : '+'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Tela Principal ──────────────────────────────────────────────────────────
export default function Vendedor() {
  const router = useRouter();

  // Pega os parâmetros da rota — compatível com como a Home navega
  const params = useLocalSearchParams<{ nome?: string; tipo?: string; distancia?: string; avaliacao?: string; aberto?: string; emoji?: string }>();

  const nome      = params.nome      ?? 'Vendedor';
  const tipo      = params.tipo      ?? '';
  const distancia = params.distancia ?? '';
  const avaliacao = parseFloat(params.avaliacao ?? '4.5');
  const aberto    = params.aberto !== 'false';
  const emoji     = params.emoji     ?? '🍽️';

  const produtos = PRODUTOS_MOCK[tipo] ?? PRODUTOS_PADRAO;

  const [totalItens, setTotalItens] = useState(0);
  const [totalValor, setTotalValor] = useState(0);

  const carrinhoScale = useRef(new Animated.Value(1)).current;
  const headerO = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerO, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(headerY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  function adicionarAoCarrinho(preco: number) {
    setTotalItens(n => n + 1);
    setTotalValor(v => v + preco);
    Animated.sequence([
      Animated.timing(carrinhoScale, { toValue: 1.15, duration: 130, useNativeDriver: true }),
      Animated.timing(carrinhoScale, { toValue: 1,    duration: 130, useNativeDriver: true }),
    ]).start();
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <FlatList
        data={produtos}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: totalItens > 0 ? 120 : 40 }}

        ListHeaderComponent={
          <Animated.View style={{ opacity: headerO, transform: [{ translateY: headerY }] }}>
            {/* Botão voltar */}
            <TouchableOpacity onPress={() => router.back()} style={s.voltarBtn}>
              <Text style={s.voltarText}>← Voltar</Text>
            </TouchableOpacity>

            {/* Perfil do vendedor */}
            <View style={s.perfil}>
              <View style={s.perfilAvatar}>
                <Text style={s.perfilEmoji}>{emoji}</Text>
              </View>

              <View style={s.perfilInfo}>
                <Text style={s.perfilNome}>{nome}</Text>
                <Text style={s.perfilTipo}>{tipo}</Text>

                <View style={s.perfilMeta}>
                  <Stars value={avaliacao} />
                  <Text style={s.perfilAval}>{avaliacao.toFixed(1)}</Text>

                  {!!distancia && (
                    <>
                      <View style={s.dot} />
                      <Text style={s.perfilDist}>📍 {distancia}</Text>
                    </>
                  )}

                  <View style={s.dot} />
                  <View style={[s.statusBadge, aberto ? s.statusAberto : s.statusFechado]}>
                    <Text style={[s.statusText, { color: aberto ? C.success : C.danger }]}>
                      {aberto ? '● Aberto' : '● Fechado'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Divisor */}
            <View style={s.divisor}>
              <View style={s.divisorLine} />
              <Text style={s.divisorLabel}>Cardápio</Text>
              <View style={s.divisorLine} />
            </View>
          </Animated.View>
        }

        renderItem={({ item }) => (
          <ProdutoCard
            item={item}
            onAdd={() => adicionarAoCarrinho(item.preco)}
          />
        )}
      />

      {/* Carrinho flutuante — só aparece se adicionou algo */}
      {totalItens > 0 && (
        <Animated.View style={[s.carrinho, { transform: [{ scale: carrinhoScale }] }]}>
          <View style={s.carrinhoInfo}>
            <View style={s.carrinhoBadge}>
              <Text style={s.carrinhoBadgeText}>{totalItens}</Text>
            </View>
            <Text style={s.carrinhoLabel}>Ver pedido</Text>
          </View>
          <Text style={s.carrinhoValor}>R$ {totalValor.toFixed(2)}</Text>
        </Animated.View>
      )}
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  /* Voltar */
  voltarBtn: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 28,
    paddingBottom: 12,
  },
  voltarText: { fontSize: 14, color: C.textSub },

  /* Perfil */
  perfil: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'flex-start',
  },
  perfilAvatar: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: C.surfaceHigh,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perfilEmoji: { fontSize: 36 },
  perfilInfo:  { flex: 1 },
  perfilNome: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22, fontWeight: '700',
    color: C.textPrimary, marginBottom: 2,
  },
  perfilTipo:  { fontSize: 13, color: C.textMuted, marginBottom: 8 },
  perfilMeta: {
    flexDirection: 'row', alignItems: 'center',
    flexWrap: 'wrap', gap: 6,
  },
  perfilAval:  { fontSize: 12, color: C.textSub, fontWeight: '600' },
  perfilDist:  { fontSize: 12, color: C.textMuted },
  dot: {
    width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: C.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20,
  },
  statusAberto:  { backgroundColor: 'rgba(34,197,94,0.1)' },
  statusFechado: { backgroundColor: 'rgba(239,68,68,0.1)' },
  statusText:    { fontSize: 11, fontWeight: '700' },

  /* Divisor */
  divisor: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginHorizontal: 20, marginBottom: 16,
  },
  divisorLine:  { flex: 1, height: 1, backgroundColor: C.border },
  divisorLabel: { fontSize: 11, color: C.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },

  /* Produto */
  produto: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    padding: 14,
  },
  produtoAvatar: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: C.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
    position: 'relative',
  },
  produtoEmoji: { fontSize: 28 },
  popularBadge: {
    position: 'absolute', top: -6, right: -6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  popularText: { fontSize: 12 },
  produtoInfo: { flex: 1 },
  produtoNome: {
    fontSize: 15, fontWeight: '700',
    color: C.textPrimary, marginBottom: 3,
  },
  produtoDesc: {
    fontSize: 12, color: C.textMuted,
    lineHeight: 16, marginBottom: 6,
  },
  produtoPreco: {
    fontSize: 15, fontWeight: '800',
    color: C.amber, letterSpacing: 0.3,
  },
  addBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.amberDim,
    borderWidth: 1.5, borderColor: C.amber,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnOk: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderColor: C.success,
  },
  addBtnText: {
    fontSize: 20, fontWeight: '700', color: C.amber, lineHeight: 24,
  },

  /* Carrinho */
  carrinho: {
    position: 'absolute', bottom: Platform.OS === 'ios' ? 34 : 20,
    left: 20, right: 20,
    backgroundColor: C.amber,
    borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: C.amber,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  carrinhoInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  carrinhoBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#0D0D0D',
    alignItems: 'center', justifyContent: 'center',
  },
  carrinhoBadgeText: {
    fontSize: 12, fontWeight: '800', color: C.amber,
  },
  carrinhoLabel: {
    fontSize: 15, fontWeight: '700', color: '#0D0D0D',
  },
  carrinhoValor: {
    fontSize: 15, fontWeight: '800', color: '#0D0D0D',
  },
});
