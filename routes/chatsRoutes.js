const express = require('express');
const router = express.Router();
const chatsController = require('../controllers/chatsController');
const { authenticateToken, authenticateRole } = require('../middlewares/authMiddleware');
const validateTwilioSignature = require('../middlewares/validateTwilioSignature'); // Importa el middleware de validación

// Ruta para recibir notificaciones de mensajes de WhatsApp
router.post('/webhook', validateTwilioSignature, chatsController.receiveWhatsAppMessage);

// Ruta para verificar el token de WhatsApp
router.get('/webhook', validateTwilioSignature, chatsController.verifyWhatsAppWebhook);

// Ruta para recibir notificaciones de estado de mensajes de WhatsApp
router.post('/status', chatsController.receiveWhatsAppStatus);

// Ruta para obtener todos los chats (solo accesible para superusuarios y admin)
router.get('/', authenticateToken, chatsController.getAllChats);

// Ruta para obtener un chat específico
router.get('/:id', authenticateToken, chatsController.getChatById);

// Ruta para actualizar el estado de un chat (cerrar, reabrir, etc.)
router.put('/:id', authenticateToken, chatsController.updateChatStatus);

// Ruta para eliminar un chat (si fuera necesario)
router.delete('/:id', authenticateToken, chatsController.deleteChat);

module.exports = router;
