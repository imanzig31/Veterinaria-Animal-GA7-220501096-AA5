const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const router = express.Router();

// Valida y crea una cuenta de usuario para el personal de la veterinaria.
router.post('/registro', async (req, res, next) => {
  try {
    const { nombre, correo, contraseña } = req.body || {};
    if (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 80) {
      return res.status(400).json({ mensaje: 'El nombre debe tener entre 2 y 80 caracteres.' });
    }
    if (typeof correo !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ mensaje: 'Ingresa un correo electrónico válido.' });
    }
    if (typeof contraseña !== 'string' || contraseña.length < 8 || contraseña.length > 72) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener entre 8 y 72 caracteres.' });
    }
    const email = correo.trim().toLowerCase();
    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
      return res.status(409).json({ mensaje: 'Ya existe una cuenta con ese correo.' });
    }
    // Solo se persiste el hash bcrypt, nunca la contraseña en texto plano.
    const passwordHash = await bcrypt.hash(contraseña, 12);
    const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .run(nombre.trim(), email, passwordHash);
    return res.status(201).json({ mensaje: 'Registro satisfactorio.',
      usuario: { id: Number(result.lastInsertRowid), nombre: nombre.trim(), correo: email } });
  } catch (error) { return next(error); }
});

// Autentica al usuario y emite un token JWT para posteriores solicitudes.
router.post('/login', async (req, res, next) => {
  try {
    const { correo, contraseña } = req.body || {};
    if (typeof correo !== 'string' || typeof contraseña !== 'string') {
      return res.status(400).json({ mensaje: 'Envía correo y contraseña.' });
    }
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(correo.trim().toLowerCase());
    // Mensaje genérico para no revelar si el correo tiene una cuenta.
    if (!user || !(await bcrypt.compare(contraseña, user.password_hash))) {
      return res.status(401).json({ mensaje: 'Error en la autenticación.' });
    }
    const token = jwt.sign({ sub: String(user.id), correo: user.email, nombre: user.name },
      process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
    return res.json({ mensaje: 'Autenticación satisfactoria.', token, tipo: 'Bearer',
      expiraEn: process.env.JWT_EXPIRES_IN || '1h',
      usuario: { id: user.id, nombre: user.name, correo: user.email } });
  } catch (error) { return next(error); }
});

// Ruta privada de muestra para verificar el token recibido en el inicio de sesión.
router.get('/perfil', requireAuth, (req, res) => {
  res.json({ mensaje: 'Sesión válida.', usuario: req.user });
});
module.exports = router;
