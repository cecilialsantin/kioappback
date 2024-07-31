const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { authenticateToken, authenticateRole } = require('./middlewares/authMiddleware');
require('dotenv').config();
const { sequelize } = require('./data');

// Middleware para parsear JSON
app.use(express.json());

// Configurar CORS
const corsOptions = {
  origin: 'http://localhost:3030', // Permitir solicitudes desde el frontend en localhost:3030
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Permitir el envío de cookies con las solicitudes
  optionsSuccessStatus: 200 // Para navegadores antiguos que requieren un código de estado 200
};

app.use(cors(corsOptions));

/// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de gestión de usuarios (solo accesibles para superusuarios)
app.use('/api/users', userRoutes);

// Servir archivos estáticos para las imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sincronizar base de datos y iniciar el servidor
sequelize.sync({ alter: true }).then(() => {
  console.log('Base de datos sincronizada');
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Backend servidor corriendo en el puerto ${PORT}`);
  });
}).catch((err) => {
  console.error('Error sincronizando la base de datos:', err);
});
