const express = require("express");
const db = require("../database/db");

const router = express.Router();

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function estaAberto(horarios) {
    if (!horarios || horarios.length === 0) return null;

    const agora = new Date();
    const diaSemana = agora.getDay();
    const horaAtual = agora.toTimeString().slice(0, 5);

    const hoje = horarios.find((h) => h.dia_semana === diaSemana);
    if (!hoje || hoje.fechado) return false;

    return horaAtual >= hoje.abertura && horaAtual <= hoje.fechamento;
}

function buscarHorarios(vendedorId) {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM horarios WHERE vendedor_id = ? ORDER BY dia_semana",
            [vendedorId],
            (err, rows) => (err ? reject(err) : resolve(rows))
        );
    });
}

function buscarResumoAvaliacoes(vendedorId) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT ROUND(AVG(nota), 1) AS media, COUNT(*) AS total
            FROM avaliacoes WHERE vendedor_id = ?`,
            [vendedorId],
            (err, row) => (err ? reject(err) : resolve(row))
        );
    });
}

async function enriquecerVendedores(vendedores) {
    return Promise.all(
        vendedores.map(async (v) => {
            const [horarios, avaliacoes] = await Promise.all([
                buscarHorarios(v.id),
                buscarResumoAvaliacoes(v.id),
            ]);
            return {
                ...v,
                aberto_agora: estaAberto(horarios),
                horarios,
                avaliacao_media: avaliacoes.media || null,
                avaliacao_total: avaliacoes.total || 0,
            };
        })
    );
}

router.post("/", (req, res) => {
    const { nome, email, senha, latitude, longitude, categoria_id, descricao, foto_url } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: "nome, email e senha são obrigatórios." });
    }

    db.run(
        `INSERT INTO vendedores (nome, email, senha, latitude, longitude, categoria_id, descricao, foto_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nome, email, senha, latitude, longitude, categoria_id, descricao, foto_url],
        function (err) {
            if (err) {
                if (err.message.includes("UNIQUE")) {
                    return res.status(409).json({ mensagem: "E-mail já cadastrado." });
                }
                return res.status(500).json({ mensagem: "Erro interno.", erro: err.message });
            }
            res.status(201).json({ id: this.lastID, mensagem: "Vendedor cadastrado com sucesse." });
        }
    );
});

router.get("/", (req, res) => {
    db.all(
        `SELECT v.*, c.nome AS categoria
        FROM vendedores v
        LEFT JOIN categorias c ON c.id = v.categoria_id`,
        [],
        async (err, rows) => {
            if (err) return res.status(500).json({ mensagem: "Erro interno.", erro: err.message });
            try {
                const resultado = await enriquecerVendedores(rows);
                res.json(resultado);
            } catch (e) {
                res.status(500).json({ mensagem: "Erro ao enriquecer dados.", erro: e.message });
            }
        }
    );
});

router.get("/proximos", async (req, res) => {
    const { lat, lon, raio = 10, categoria_id, apenas_aberto } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ mensagem: "Parâmetros lat e lon são obrigatórios." });
    }

    let query = `
        SELECT v.*, c.nome AS categoria
        FROM vendedores v
        LEFT JOIN categorias c ON c.id = v.categoria_id
        WHERE v.latitude IS NOT NULL AND v.longitude IS NOT NULL
    `;
    const params = [];

    if (categorias_id) {
        query += " AND v.categoria_id = ?";
        params.push(categoria_id);
    }

    db.all(query, params, async (err, rows) => {
        if (err) return res.status(500).json({ mensagem: "Erro interno.", erro: err.message });

        try {
            let resultado = rows.map((v) => ({
                ...v,
                distancia_km: parseFloat(
                    calcularDistancia(parseFloat(lat), parseFloat(lon), v.latitude, v.longitude).toFixed(2)
                ),
            }));

            resultado = resultado.filter((v) => v.distancia_km <= parseFloat(raio));

            resultado = await enriquecerVendedores(resultado);

            if (apenas_aberto === "true") {
                resultado = resultado.filter((v) => v.aberto_agora === true);
            }

            resultado.sort((a, b) => a.distancia_km - b.distancia_km);

            res.json(resultado)
        } catch (e) {
            res.status(500).json({ mensagem: "Erro ao processar dados.", erro: e.message });
        }
    });
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    db.get(
        `SELECT v.*, c.nome AS categoria
        FROM vendedores v
        LEFT JOIN categorias c ON c.id = v.categoria_id
        WHERE v.id = ?`,
        [id],
        async (err, vendedor) => {
            if (err) return res.status(500).json({ mensagem: "Erro interno.", erro: err.message });
            if (!vendedor) return res.status(404).json({ mensagem: "Vendedor não encontrado." });

            try {
                const [enriquecido] = await enriquecerVendedores([vendedor]);
                res.json(enriquecido);
            } catch (e) {
                res.status(500).json({ mensagem: "Erro ao enriquecer dados.", erro: e.message });
            }
        }
    );
});

router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { nome, latitude, longitude, categoria_id, descricao, foto_url } = req.body;

    db.run(
        `UPDATE vendedores
        SET nome = COALESCE(?, nome),
            latitude = COALESCE(?, latitude),
            longitude = COALESCE(?, longitude),
            categoria_id = COALESCE(?, categoria_id),
            descricao = COALESCE(?, descricao),
            foto_url = COALESCE(?, foto_url)
        WHERE id = ?`,
        [nome, latitude, longitude, categoria_id, descricao, foto_url, id],
        function (err) {
            if (err) return res.status(500).json({ mensagem: "Erro interno.", erro: err.message });
        if (this.changes === 0) return res.status(404).json({ mensagem: "Vendedor não encontrado." });
        res.json({ mensagem: "Vendedor atualizado com sucesso." });
        }
    );
});

router.post("/:id/horarios", (req, res) => {
    const { id } = req.params;
    const horarios = req.body;

    if (!Array.isArray(horarios) || horarios.length === 0) {
        return res.status(400).json({ mensagem: "Envie um array de horários." });
    }

    const stmt = db.prepare(
        `INSERT INTO horarios (vendedor_id, dia_semana, abertura, fechamento, fechado)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(vendedor_id, dia_semana) DO UPDATE SET
            abertura = excluded.abertura
            fechamento = excluded.fechamento,
            fechado = excluded.fechado`
    );

    db.serialize(() => {
        db.run("BEGIN");
        try {
            horarios.forEach(({ dia_semana, abertura, fechamento, fechado = 0 }) => {
                stmt.run([id, dia_semana, abertura, fechamento, fechado ? 1 : 0]);
            });
            stmt.finalize();
            db.run("COMMIT");
            res.status(201).json({ mensagem: "Horários salvos com sucesso." });
        } catch (e) {
            db.run("ROLLBACK");
            res.status(500).json({ mensagem: "Erro ao salvar horários.", erro: e.message });
        }
    });
});

router.get("/:id/horarios", (req, res) => {
    db.all(
        "SELECT * FROM horarios WHERE vendedor_id = ? ORDER BY dia_semana",
        [req.params.id],
        (err, rows) => {
            if (err) return res.status(500).json({ mensagem: "Erro interno.", erro : err.message });
            res.json(rows);
        }
    );
});

router.post("/:id/avaliacoes", (req, res) => {
    const { id } = req.params;
    const { nota, comentario, autor_nome } = req.body;
    
    if (!nota || nota < 1 || nota > 5) {
        return res.status(400).json({ mensagem: "nota de ser um número entre 1 e 5." });
    }

    db.run(
        `INSERT INTO avaliacoes (vendedor_id, nota, comentario, autor_nome)
        VALUES (?, ?, ?, ?)`
        [id, nota, comentario, autor_nome],
        function (err) {
            if (err) return res.status(500).json({ mensagem: "Erro interno.", erro: err.message });
            res.status(201).json({ id: this.lastID, mensagem: "Avaliação registrada com sucesso." });
        }
    );
});

router.get("/:id/avaliacoes", (req, res) => {
    db.all(
        `SELECT * FROM avaliacoes WHERE vendedor_id = ? ORDER BY criado_em DESC`,
        [req.params.id],
        (err, rows) => {
            if (err) return req.status(500).json({ mensagem: "Erro interno.", erro: err.message });
            res.json(rows);
        }
    );
});

module.exports = router;