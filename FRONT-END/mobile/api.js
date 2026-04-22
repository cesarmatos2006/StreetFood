// ─────────────────────────────────────────────────────────────
//  api.js — troque BASE_URL pelo IP do seu computador
//  Ex: http://192.168.1.105:3000
// ─────────────────────────────────────────────────────────────
const BASE_URL = 'http://192.168.0.9:3000';

const get = (path) =>
  fetch(`${BASE_URL}${path}`).then((r) => r.json());

const post = (path, body) =>
  fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json());

export const api = {
  // AUTH
  login: (email, senha) => post('/auth/login', { email, senha }),

  // VENDEDORES
  getVendedoresProximos: (lat, lon, filtros = {}) => {
    const params = new URLSearchParams({ lat, lon, ...filtros });
    return get(`/vendedores/proximos?${params}`);
  },
  getVendedor: (id) => get(`/vendedores/${id}`),
  cadastrarVendedor: (dados) => post('/vendedores', dados),

  // HORÁRIOS
  salvarHorarios: (vendedorId, horarios) =>
    post(`/vendedores/${vendedorId}/horarios`, horarios),

  // PRODUTOS
  getProdutos: (vendedorId) => get(`/produtos/${vendedorId}`),
  cadastrarProduto: (dados) => post('/produtos', dados),

  // CATEGORIAS
  getCategorias: () => get('/categorias'),

  // AVALIAÇÕES
  getAvaliacoes: (vendedorId) => get(`/vendedores/${vendedorId}/avaliacoes`),
  avaliar: (vendedorId, dados) =>
    post(`/vendedores/${vendedorId}/avaliacoes`, dados),
};