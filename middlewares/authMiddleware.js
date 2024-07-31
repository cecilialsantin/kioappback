const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).send('Token es requerido');

  const token = authHeader.split(' ')[1]; // Obtener la parte real del token después de "Bearer"
  if (!token) return res.status(403).send('Token es requerido');

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).send('Token no es válido');
    req.user = decoded;
    next();
  });
};

const authenticateRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).send('No tienes acceso a este recurso');
  }
  next();
};

module.exports = {
  authenticateToken,
  authenticateRole
};
