import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5173;

// Sirve archivos estáticos desde la carpeta dist
app.use(express.static(path.join(__dirname, "dist")));

// Maneja todas las rutas enviando el archivo index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
