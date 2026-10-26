require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('node:path');
const authRoutes = require('./routes/auth');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Configura JWT_SECRET con al menos 32 caracteres en el archivo .env');
}
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
// Sirve el frontend y la API desde el mismo origen para abrirla en el navegador.
app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/', (_req, res) => res.json({ servicio: 'Clínica Veterinaria Huellitas', estado: 'activo' }));
app.use('/api/auth', authRoutes);

// Convierte errores comunes en respuestas JSON claras para Postman.
app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición debe ser JSON válido.' });
  }
  console.error(error);
  return res.status(500).json({ mensaje: 'Error interno del servidor.' });
});
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`API veterinaria disponible en http://localhost:${port}`));

