const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("database.db");

db.serialize(() => {
  db.run(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE
      )
    `);

  const categoriasSeed = [
    "Lanches",
    "Comida Mexicana",
    "Churrasco / Espetinho",
    "Doces e Sobremesas",
    "Bebidas",
    "Comida Japonesa",
    "Pizza",
    "Outros"
  ];
  const stmtCat = db.prepare(
    "INSERT OR IGNORE INTO categoria (nome) VALUES (?)"
  );
  categoriasSeed.forEach((nome) => stmtCat.run(nome));
  stmtCat.finalize();

  db.run(`
    CREATE TABLE IF NOT EXISTS vendedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT,
      senha TEXT,
      latitude REAL,
      longitude REAL,
      categoria_id INTEGER REFERENCES categorias(id),
      descricao TEXT,
      foto_url TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS horarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendedor_id INTEGER NOT NULL REFERENCES vendedores(id) ON DELETE CASCADE,
      dia_semana INTEGER NOT NULL CHECK(dia_semana BETWEEN 0 AND 6),
      abertura TEXT NOT NULL, -- formato "HH:MM"
      fechamento TEXT NOT NULL, -- formato "HH:MM"
      fechado INTEGER NOT NULL DEFAULT 0,
      UNIQUE(vendedor_id), dia_semana)
    )
    `);

  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      descrição TEXT,
      preco REAL NOT NULL,
      foto_url TEXT,
      disponivel INTEGER NOT NULL DEFAULT 1,
      vendedor_id INTEGER NOT NULL REFERENCES vendedores(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS avaliacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendedor_id INTEGER NOT NULL REFERNCES vendedores(id) ON DELETE CASCADE,
      nota INTEGER NOT NULL CHECK(nota BETWEEN 1 AND 5),
      comentario TEXT,
      autor_nome TEXT,
      criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    )
  `);
});

module.exports = db;