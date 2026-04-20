const express = require("express");
const db = require("../database/db");

const router = express.Router();

router.post("/", (req, res) => {
    const { nome, descricao, preco, foto_url, disponivel = 1, vendedor_id } = req.body;

    if (!nome || !preco || !vendedor_id) {
        return res.status(400).json({ mensagem: "nome, preco e vendedor_id são obrigatórios." });
    }

    db.run(
        `INSERT INTO produtos (nome, descricao, preco, foto_url, disponivel, vendedor_id)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [nome, descricao, preco, foto_url, disponivel ? 1 : 0, vendedor_id],
        function (err) {
            if (err) return res.status(500).json({ mensagem: "Erro interno.", erro: err.message });
            res.status(201).json({ id: this.lastID, mensagem: "Produto cadastrado com sucesso" });
        }
    );
});

router.get("/:vendedorId", (req, res) => {
    const { vendedorId } = req.params;
    const { apenas_disponivel } = req.query;

    let query = "SELECT * FROM produtos WHERE vendedor_id = ?";
    if (apenas_disponivel === "true") query += " AND disponivel = 1";
    query += " ORDER BY nome";

    db.all(query, [vendedorId], (err, rows) => {
        if (err) return res.status(500).json({ mensagem: "Erro interno.", erro: err.message });
        res.json(rows);
    });
});

router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { nome, descricao, preco, foto_url, disponivel } = req.body;

    db.run(
        `UPDATE produtos
        SET nome = COALESCE(?, nome),
            descricao = COALESCE(?, descricao),
            preco = COALESCE(?, preco),
            foto_url = COALESCE(?, foto_url),
            disponivel = CASE WHEN ? IS NULL THEN disponivel ELSE ? END
        WHERE id = ?`,
        [nome, descricao, preco, foto_url, disponivel, disponivel != null ? (disponivel ? 1 : 0) : null, id],
        function (err) {
            if (err) return res.status(500).json({ mensagem: "Erro interno.", erro: err.message });
            if (this.changes === 0) return res.status(404).json({ mensagem: "Produtos não encontrado." });
            res.json({ mensagem: "Produto atualizado com sucesso." });
        }
    );
});

router.delete("/:id", (req, res) => {
    db.run("DELETE FROM produtos WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ mensagem: "Erro interno.", erro: err.message });
        if (this.changes === 0) return res.status(404).json({ mensagem: "Produto não encontrado." });
        res.json({ mensagem: "Produto removido com sucesso" });
    });
});

module.exports = router;