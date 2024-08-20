//server.js con socket

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const socketAuthMiddleware = require('./middlewares/socketAuthMiddleware'); // Importar el middleware

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3030', process.env.NGROK_URL],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

module.exports.io = io;  // Exportar el objeto io para usar en otros módulos

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatsRoutes = require('./routes/chatsRoutes');
const contactsRoutes = require('./routes/contactsRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const institutionRoutes = require('./routes/institutionRoutes');

require('dotenv').config();
const { sequelize } = require('./data');

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar CORS
const corsOptions = {
  origin: ['http://localhost:3030', process.env.NGROK_URL],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

/// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de gestión de usuarios 
app.use('/api/users', userRoutes);

// Rutas para la gestión de chats
app.use('/api/chats', chatsRoutes);

//Rutas para la gestion de contacts
app.use('/api/contacts', contactsRoutes);

//Rutas para la gestion de institutions
app.use('/api/institutions', institutionRoutes);

//Rutas para la gestion de equipments
app.use('/api/equipments', equipmentRoutes);

// Servir archivos estáticos para las imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Usar el middleware de autenticación para socket.io
io.use(socketAuthMiddleware);

// Conexión de WebSocket
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Evento para manejar la desconexión
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Sincronizar base de datos y iniciar el servidor
sequelize.sync({ alter: true }).then(() => {
  console.log('Base de datos sincronizada');
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Backend servidor corriendo en el puerto ${PORT}`);
  });
}).catch((err) => {
  console.error('Error sincronizando la base de datos:', err);
});
