import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const STORAGE_KEY = '@streetfood_user';

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [ready, setReady]   = useState(false); // ✅ evita flash de tela no boot

  // ── Restaura sessão ao abrir o app ──────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => { if (raw) setUser(JSON.parse(raw)); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  // ── Salva/limpa sempre que user mudar ───────────────────────
  useEffect(() => {
    if (!ready) return;
    if (user) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user)).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    }
  }, [user, ready]);

  // ── Login de vendedor (vem do backend com id real) ──────────
  const login = (userData) =>
    setUser({ ...userData, tipo: 'vendedor' });

  // ── Login de cliente (local, sem backend) ───────────────────
  const entrarComoCliente = (dados = {}) =>
    setUser({ nome: 'Visitante', ...dados, tipo: 'cliente' });

  const logout = () => setUser(null);

  // ✅ isVendedor é a fonte de verdade para permissões
  const isVendedor = user?.tipo === 'vendedor';

  return (
    <AuthContext.Provider value={{ user, login, entrarComoCliente, logout, isVendedor, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);