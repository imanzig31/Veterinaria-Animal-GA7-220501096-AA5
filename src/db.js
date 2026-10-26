const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

// Creamos automáticamente el directorio de datos local.
const dbPath = path.resolve(process.env.DB_PATH || './data/veterinaria.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// El correo único impide registrar dos cuentas con la misma dirección.
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);
module.exports = db;
