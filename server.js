const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatsRoutes = require('./routes/chatsRoutes')


require('dotenv').config();
const { sequelize } = require('./data');

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Rutas de gestión de usuarios 
app.use('/api/users', userRoutes);

// Rutas para la gestion de chats
app.use('/api/chats', chatsRoutes);

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

// Iniciar NGROK

/*const { exec } = require('child_process');
const subdomain = process.env.NGROK_SUBDOMAIN;

exec(`ngrok http --subdomain=${subdomain} 3000`, (err, stdout, stderr) => {
  if (err) {
    console.error(`Error iniciando ngrok: ${err.message}`);
    return;
  }
  console.log(`ngrok iniciado: ${stdout}`);
});*/

