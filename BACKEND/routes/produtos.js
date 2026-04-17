const express = require("express");
const db = require("../database/db");

const router = express.Router();

router.post("/", (req, res) => {
    const { nome, preco, vendedor_id } = req.body;

    db.run(
        `INSERT INTO produtos (nome, preco, vendedor_id)
        VALUES (?, ?, ?)`,
        [nome, preco, vendedor_id],
        function (err) {
            if (err) return res.status(500).json(err);

            res.json({ id: this.lastID });
        }
    );
});

router.get("/:vendedorId", (req, res) => {
    const { vendedorId } = req.params;

    db.all(
        "SELECT * FROM produtos WHERE vendedor_id = ?",
        [vendedorId],
        (err, rows) => {
            if (err) return res.status(500).json(err);

            res.json(rows);
        }
    );
});

module.exports = router;