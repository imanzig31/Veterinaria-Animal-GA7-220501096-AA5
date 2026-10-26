const jwt = require('jsonwebtoken');

// Comprueba el token Bearer antes de permitir el acceso a rutas privadas.
function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'Se requiere un token Bearer válido.' });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
}
module.exports = requireAuth;
