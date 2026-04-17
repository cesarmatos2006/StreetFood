const express = require("express");
const db = require("../database/db");

const router = express.Router();

router.post("/", (req,res) => {
    const { nome, email, senha, latitude, longitude } = req.body;

    db.run(
        `INSERT INTO vendedores (nome, email, senha, latitude, longitude)
        VALUES (?, ?, ?, ?, ?)`,
        [nome, email, senha, latitude, longitude],
        function (err) {
            if (err) return res.status(500).json(err);

            res.json({ id: this.lastID });
        }
    );
});

router.get("/", (req, res) => {
    db.all("SELECT * FROM vendedores", [], (err, rows) => {
        if (err) return res.status(500).json(err);

        res.json(rows);
    });
});

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI/180) *
        Math.cos(lat2 * Math.PI/180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

router.get("/proximos", (req, res) => {
    const { lat, lon } = req.query;

    db.all("SELECT * FROM vendedores", [], (err, rows) => {
        if (err) return res.status(500).json(err);

        const proximos = rows.map(v => {
            const distancia = calcularDistancia(
                lat,
                lon,
                v.latitude,
                v.longitude
            );

            return { ...v, distancia };
        });

        res.json(proximos.sort((a, b) => a.distancia - b.distancia));
    });
});

module.exports = router;