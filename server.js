const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();
const { sequelize } = require('./data');

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`KioApp servidor corriendo en el puerto ${PORT}`);
});
