const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const app = express();
const DATA_PATH = "./persistance.json";

app.use(express.static(path.join(__dirname, "..")));
app.use(cors());
app.use(express.json());

// Leggi dati
app.get("/data", (req, res) => {
  fs.readFile(DATA_PATH, "utf8", (err, data) => {
    if (err) return res.json({ categorie: [], note: [] });
    res.json(JSON.parse(data));
  });
});

// Salva dati
app.post("/data", (req, res) => {
  fs.writeFile(DATA_PATH, JSON.stringify(req.body, null, 2), (err) => {
    if (err) return res.status(500).json({ ok: false });
    res.json({ ok: true });
  });
});

// Route per le note di una singola categoria

app.listen(3000, () => console.log("Server avviato su http://localhost:3000"));
