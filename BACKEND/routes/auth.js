const express = require("express");
const db = require("../database/db");

const router = express.Router();

router.post("/login", (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ mensagem: "E-mail e senha são obrigatórios." });
    }

    db.get(
        `SELECT v.id, v.nome, v.email, v.latitude, v.longitude,
            v.descricao, v.foto_url,
            c.nome AS categoria
        FROM vendedores v
        LEFT JOIN categorias c ON c.id = v.categoria_id
        WHERE v.email = ? AND v.senha = ?`,
        [email, senha],
        (err, user) => {
            if (err) return res.status(500).json({ mensagem: "Erro interno.", erro: err.message });
            if (!user) return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });

            res.json({ mensagem: "Login realizado com sucesso.", user });
        }
    );
});

module.exports = router