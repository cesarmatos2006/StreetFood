const express = require("express");
const db = require("../database/db");

const router = express.Router();

router.get("/", (req, res) => {
    db.all("SELECT * FROM categorias ORDER BY nome", [], (err, rows) => {
        if (err) return res.status(500).json({ mensagem: "Erro interno.", erro: err.message });
        res.json(rows);
    });
});

router.post("/", (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ mensagem: "nome é obrigatório" });

    db.run("INSERT INTO categorias (nome) VALUES (?)", [nome], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE")) {
                return res.status(409).json({ mensagem: "Categoria já existe." });
            }
            return res.status(500).json({ mensagem: "Erro interno.", erro: err.message });
        }
        res.status(201).json({ id: this.lastID, mensagem: "Categoria criada com sucesso." });
    });
});

module.exports = router;