const { Chat, Contact } = require('../data');
const { processWhatsAppMessage, verifyWhatsAppWebhookService } = require('../services/whatsappService');
const { io } = require('../server');

const receiveWhatsAppMessage = async (req, res) => {
  try {
    const { body } = req;
    console.log('Webhook received:', body);
    
    const result = await processWhatsAppMessage(body);
    
    // Emitir el evento para notificar a los clientes conectados
    io.emit('newMessage', result);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error receiving WhatsApp message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Verificar el webhook de WhatsApp
const verifyWhatsAppWebhook = (req, res) => {
  verifyWhatsAppWebhookService(req, res);
};


// Recibir estado de mensajes de WhatsApp
const receiveWhatsAppStatus = async (req, res) => {
  try {
    const { MessageSid, MessageStatus } = req.body;

    console.log(`Message SID: ${MessageSid}`);
    console.log(`Message Status: ${MessageStatus}`);

    const chat = await Chat.findOne({ where: { messageSid: MessageSid } });

    if (chat) {
      chat.status = MessageStatus;
      await chat.save();
    }

    res.status(200).send('Status received');
  } catch (error) {
    console.error('Error receiving WhatsApp status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Crear un nuevo chat
const createChat = async (req, res) => {
  try {
    const { message, mediaType, mediaUrl, contactId } = req.body;

    let contact = await Contact.findByPk(contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const newChat = await Chat.create({
      message,
      mediaType,
      mediaUrl,
      contactId: contact.id,
      status: 'open'
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Obtener todos los chats para un contacto
const getChatsForContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findByPk(contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const chats = await Chat.findAll({ where: { contactId } });

    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cerrar un chat
const closeChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    chat.status = 'closed';
    await chat.save();

    res.status(200).json(chat);
  } catch (error) {
    console.error('Error closing chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Obtener todos los chats
const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.findAll();
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Obtener un chat por ID
const getChatById = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findByPk(id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.status(200).json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Actualizar el estado de un chat
const updateChatStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const chat = await Chat.findByPk(id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    chat.status = status;
    await chat.save();

    res.status(200).json(chat);
  } catch (error) {
    console.error('Error updating chat status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Eliminar un chat
const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findByPk(id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    await chat.destroy();
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  receiveWhatsAppMessage,
  verifyWhatsAppWebhook,
  receiveWhatsAppStatus,
  createChat,
  getChatsForContact,
  closeChat,
  getAllChats,
  getChatById,
  updateChatStatus,
  deleteChat
};
