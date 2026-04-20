const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const vendedoresRoutes = require("./routes/vendedores");
const produtosRoutes = require("./routes/produtos");
const categoriasRoutes = require("./routes/categorias");

app.use("/auth", authRoutes);
app.use("/vendedores", vendedoresRoutes);
app.use("/produtos", produtosRoutes);
app.use("/categorias", categoriasRoutes);

app.get("/", (req, res) => res.json({ status: "StreetFood API rodando"}));

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000")
});