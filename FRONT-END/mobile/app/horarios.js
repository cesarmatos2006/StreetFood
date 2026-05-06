import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Switch, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth.js';

// ── Nomes dos dias ───────────────────────────────────────────
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// ── Horários padrão para preencher quando vazio ───────────────
const HORARIO_PADRAO = { abertura: '08:00', fechamento: '18:00', fechado: false };

// ── Opções de horário em intervalos de 30 min ─────────────────
const OPCOES_HORA = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    OPCOES_HORA.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

// ── Seletor de hora simples (ScrollView horizontal) ───────────
function SeletorHora({ valor, onChange, label }) {
  return (
    <View style={s.seletorWrap}>
      <Text style={s.seletorLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.seletorScroll}>
        {OPCOES_HORA.map((h) => (
          <TouchableOpacity
            key={h}
            style={[s.horaChip, valor === h && s.horaChipActive]}
            onPress={() => onChange(h)}
          >
            <Text style={[s.horaText, valor === h && s.horaTextActive]}>{h}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Card de um dia da semana ──────────────────────────────────
function DiaCard({ dia, index, horario, onChange }) {
  return (
    <View style={s.diaCard}>
      <View style={s.diaHeader}>
        <Text style={s.diaNome}>{dia}</Text>
        <View style={s.diaToggle}>
          <Text style={[s.diaToggleText, horario.fechado && s.diaToggleTextFechado]}>
            {horario.fechado ? 'Fechado' : 'Aberto'}
          </Text>
          <Switch
            value={!horario.fechado}
            onValueChange={(val) => onChange(index, { ...horario, fechado: !val })}
            trackColor={{ false: '#2A2A35', true: '#FF6B2B44' }}
            thumbColor={!horario.fechado ? '#FF6B2B' : '#555'}
            ios_backgroundColor="#2A2A35"
          />
        </View>
      </View>

      {!horario.fechado && (
        <View style={s.diaHorarios}>
          <SeletorHora
            label="Abre"
            valor={horario.abertura}
            onChange={(v) => onChange(index, { ...horario, abertura: v })}
          />
          <SeletorHora
            label="Fecha"
            valor={horario.fechamento}
            onChange={(v) => onChange(index, { ...horario, fechamento: v })}
          />
        </View>
      )}
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────
export default function Horarios() {
  const router      = useRouter();
  const { user, isVendedor } = useAuth();

  const [horarios,  setHorarios]  = useState(
    DIAS.map((_, i) => ({ dia_semana: i, ...HORARIO_PADRAO }))
  );
  const [loading,   setLoading]   = useState(true);
  const [salvando,  setSalvando]  = useState(false);

  // ✅ Guarda: apenas vendedores
  useEffect(() => {
    if (!isVendedor) {
      Alert.alert('Acesso restrito', 'Apenas vendedores podem definir horários.', [
        { text: 'Voltar', onPress: () => router.replace('/home') },
      ]);
    }
  }, [isVendedor]);

  // Carrega horários existentes do backend
  useEffect(() => {
    if (!user?.id || !isVendedor) { setLoading(false); return; }

    api.getVendedor(user.id)
      .then((v) => {
        if (v?.horarios?.length > 0) {
          // Preenche os 7 dias, substituindo os que vieram do backend
          const mapa = {};
          v.horarios.forEach((h) => { mapa[h.dia_semana] = h; });
          setHorarios(
            DIAS.map((_, i) => mapa[i]
              ? { dia_semana: i, abertura: mapa[i].abertura, fechamento: mapa[i].fechamento, fechado: !!mapa[i].fechado }
              : { dia_semana: i, ...HORARIO_PADRAO }
            )
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const atualizarDia = (index, novoHorario) => {
    setHorarios((prev) => prev.map((h, i) => (i === index ? novoHorario : h)));
  };

  const salvar = async () => {
    if (!user?.id) return;
    setSalvando(true);
    try {
      await api.salvarHorarios(user.id, horarios);
      Alert.alert('Salvo!', 'Horários de funcionamento atualizados.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Verifique a conexão.');
    } finally {
      setSalvando(false);
    }
  };

  if (!isVendedor) return null;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.title}>Horários de funcionamento</Text>
        <Text style={s.sub}>Define quando sua barraca está aberta</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#FF6B2B" style={{ flex: 1 }} />
      ) : (
        <ScrollView contentContainerStyle={s.lista} showsVerticalScrollIndicator={false}>
          {DIAS.map((dia, i) => (
            <DiaCard
              key={i}
              dia={dia}
              index={i}
              horario={horarios[i]}
              onChange={atualizarDia}
            />
          ))}

          <TouchableOpacity style={s.btnSalvar} onPress={salvar} disabled={salvando}>
            {salvando
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnSalvarText}>Salvar horários</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#0E0E12' },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 16 : 24, paddingBottom: 16, gap: 4 },
  backText: { color: '#888', fontSize: 15, marginBottom: 8 },
  title:    { fontSize: 22, fontWeight: '700', color: '#fff' },
  sub:      { fontSize: 13, color: '#666' },

  lista: { paddingHorizontal: 18, paddingBottom: 40, gap: 10 },

  diaCard: {
    backgroundColor: '#18181F',
    borderWidth: 1.5, borderColor: '#2A2A35',
    borderRadius: 14, padding: 14, gap: 12,
  },
  diaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diaNome:   { fontSize: 15, fontWeight: '600', color: '#fff' },
  diaToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  diaToggleText:       { fontSize: 12, color: '#4CAF50', fontWeight: '500' },
  diaToggleTextFechado:{ color: '#E24B4A' },

  diaHorarios: { gap: 10 },

  seletorWrap:   { gap: 6 },
  seletorLabel:  { fontSize: 11, color: '#888', fontWeight: '500' },
  seletorScroll: { flexGrow: 0 },
  horaChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1.5, borderColor: '#2A2A35', marginRight: 6,
  },
  horaChipActive: { backgroundColor: '#FF6B2B', borderColor: '#FF6B2B' },
  horaText:       { color: '#888', fontSize: 13, fontWeight: '500' },
  horaTextActive: { color: '#fff' },

  btnSalvar: {
    backgroundColor: '#FF6B2B',
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
  },
  btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});