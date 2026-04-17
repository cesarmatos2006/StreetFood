const express = require("express");
const db = require("../database/db");

const router = express.Router();

router.post("/login", (req, res) => {
    const {email, senha } = req.body;

    db.get(
        "SELECT * FROM vendedores WHERE email = ? AND senha = ?",
        [email, senha],
        (err, user) => {
            if (err) return res.status(500).json(err);

            if(!user) {
                return res.status(401).json({ mensagem: "Usuário não encontrado" });
            }

            res.json({ mensagem: "Login sucesso", user });
        }
    );
});

module.exports = router