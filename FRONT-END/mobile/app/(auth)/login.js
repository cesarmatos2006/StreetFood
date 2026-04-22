import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../api';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.login(email, senha);
      if (res.user) {
        login(res.user);
        router.replace('/home');
      } else {
        Alert.alert('Erro', res.mensagem || 'Credenciais inválidas.');
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
        style={s.container}
      >
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Text style={s.backText}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={s.title}>Bem-vindo de volta</Text>
        <Text style={s.sub}>Faça login para continuar</Text>

        <View style={s.form}>
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
            placeholder="••••••••"
            placeholderTextColor="#555"
            secureTextEntry
          />

          <TouchableOpacity onPress={handleLogin} style={s.btnPrimary} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Entrar</Text>}
          </TouchableOpacity>

          <View style={s.divider}>
            <View style={s.line} />
            <Text style={s.ou}>ou</Text>
            <View style={s.line} />
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/cadastro')}>
            <Text style={s.registerText}>
              Não tem conta? <Text style={s.link}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0E0E12' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  back: { marginBottom: 24 },
  backText: { color: '#888', fontSize: 15 },
  title: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 6 },
  sub: { fontSize: 14, color: '#666', marginBottom: 32 },
  form: { gap: 12 },
  label: { fontSize: 12, color: '#888', fontWeight: '500', marginBottom: -4 },
  input: {
    backgroundColor: '#18181F',
    borderWidth: 1.5,
    borderColor: '#2A2A35',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#fff',
  },
  btnPrimary: {
    backgroundColor: '#FF6B2B',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  line: { flex: 1, height: 1, backgroundColor: '#2A2A35' },
  ou: { color: '#555', fontSize: 13 },
  registerText: { textAlign: 'center', fontSize: 14, color: '#666' },
  link: { color: '#FF6B2B', fontWeight: '600' },
});