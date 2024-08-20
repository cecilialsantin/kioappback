// middlewares/socketAuthMiddleware.js
const jwt = require('jsonwebtoken');

const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'superuser' || decoded.role === 'admin') {
      socket.user = decoded; // Almacenar la información del usuario en el socket
      next();
    } else {
      return next(new Error('Authorization error'));
    }
  } catch (err) {
    return next(new Error('Authentication error'));
  }
};

module.exports = socketAuthMiddleware;
