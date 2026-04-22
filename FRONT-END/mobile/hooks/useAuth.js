import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Vendedor: tem id real no backend
  const login = (userData) => setUser({ ...userData, tipo: 'vendedor' });

  // Cliente: pode passar dados do formulário ou usar anônimo
  const entrarComoCliente = (dados = {}) =>
    setUser({ nome: 'Visitante', ...dados, tipo: 'cliente' });

  const logout = () => setUser(null);

  const isVendedor = user?.tipo === 'vendedor';

  return (
    <AuthContext.Provider value={{ user, login, entrarComoCliente, logout, isVendedor }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);