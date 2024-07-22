const express = require('express');
const path = require('path');
const app = express();
const authRoutes = require('./routes/authRoutes');
const authenticateToken = require('./middlewares/authMiddleware');
require('dotenv').config();
const { sequelize } = require('./data');

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta inicio para prueba del localhost:3000

// Ruta raíz para servir la página HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta protegida de prueba
app.get('/api/protected', authenticateToken, (req, res) => {
  res.send('Esta es una ruta protegida');
});

// Rutas
app.use('/api/auth', authRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`KioApp servidor corriendo en el puerto ${PORT}`);
});
