require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const productsRoutes = require("./routes/productsRoutes");
const controller = require("./controllers/productsController");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("/api/dashboard", controller.dashboard);
app.use("/api/products", productsRoutes);

app.use((req, res) => res.status(404).json({ message: "Rota não encontrada." }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Erro interno do servidor." });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`StockMarket Manager em http://localhost:${port}`));
