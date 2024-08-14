const express = require('express');
const router = express.Router();
const chatsController = require('../controllers/chatsController');
const { authenticateToken, authenticateRole } = require('../middlewares/authMiddleware');

// Ruta para recibir notificaciones de mensajes de WhatsApp
router.post('/webhook', chatsController.receiveWhatsAppMessage);

// Ruta para verificar el token de WhatsApp
router.get('/webhook', chatsController.verifyWhatsAppWebhook);

// Ruta para recibir notificaciones de estado de mensajes de WhatsApp
router.post('/status', chatsController.receiveWhatsAppStatus);

// Ruta para obtener todos los chats (solo accesible para superusuarios y admin)
router.get('/', authenticateToken, authenticateRole(['superuser', 'admin', 'observer']), chatsController.getAllChats);

// Ruta para obtener un chat específico
router.get('/:id', authenticateToken, authenticateRole(['superuser', 'admin', 'observer']), chatsController.getChatById);

// Ruta para actualizar el estado de un chat (cerrar, reabrir, etc.)
router.put('/:id', authenticateToken, authenticateRole(['superuser', 'admin']), chatsController.updateChatStatus);

// Ruta para eliminar un chat (si fuera necesario)
router.delete('/:id', authenticateToken, authenticateRole(['superuser', 'admin']), chatsController.deleteChat);

module.exports = router;
