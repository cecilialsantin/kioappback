const { Chat, Contact } = require('../data');
const { processWhatsAppMessage, verifyWhatsAppWebhookService, sendWhatsAppMessage } = require('../services/whatsappService');
const { io } = require('../server');


const receiveWhatsAppMessage = async (req, res) => {
  try {
    const { body } = req;

    // Verificar si es un mensaje de estado
    if (body.MessageStatus && body.MessageSid) {
      await receiveWhatsAppStatus(req, res);  // Reutiliza tu función existente para manejar el estado
      return;
    }

    const result = await processWhatsAppMessage(body);

    if (result) {
      io.emit('newMessage', result);
      res.status(201).json(result);
    } else {
      res.status(204).send();  // No content, porque no se creó un nuevo mensaje
    }
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

const sendMessageToChat = async (req, res) => {
  try {
    const { ticketID, message, mediaUrl } = req.body;

    if ((!message || message.trim() === '') && !mediaUrl) {
      return res.status(400).json({ error: 'Message or mediaUrl must be provided and not be empty' });
    }

    console.log('Datos recibidos:', { ticketID, message, mediaUrl });

    const chat = await Chat.findOne({ where: { ticketID, status: 'open' } });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found for this ticketID' });
    }

    const contact = await Contact.findByPk(chat.contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    console.log('Enviando mensaje a:', contact.phoneNumber);

    const result = await sendWhatsAppMessage(contact.phoneNumber, message, mediaUrl);

    if (!result) {
      return res.status(500).json({ error: 'Failed to send message via Twilio' });
    }

    // Verificar si ya existe un chat con este messageSid
    const existingMessage = await Chat.findOne({ where: { messageSid: result.sid } });
    if (existingMessage) {
      return res.status(409).json({ error: 'Message already exists' });
    }

    const newMessage = await Chat.create({
      message,
      mediaType: mediaUrl ? 'media' : 'text',
      mediaUrl: mediaUrl || null,
      contactId: contact.id,
      ticketID: chat.ticketID,
      status: 'open',
      messageSid: result.sid,
      isSentByUser: true,
    });

    res.status(200).json(newMessage);
  } catch (error) {
    console.error('Error sending message to chat:', error);
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

    // Buscar un chat abierto existente para este contacto
    let openChat = await Chat.findOne({
      where: {
        contactId: contact.id,
        status: 'open'
      }
    });

    let ticketID = openChat ? openChat.ticketID : uuidv4(); // Si hay un chat abierto, usamos su ticketID, si no, generamos uno nuevo

    const newChat = await Chat.create({
      message,
      mediaType,
      mediaUrl,
      contactId: contact.id,
      ticketID,  // Asociar el nuevo chat con un ticketID
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
    const { ticketID } = req.params;

    const chatsToClose = await Chat.findAll({
      where: {
        ticketID,
        status: ['open', 'read', 'delivered'],
      }
    });

    if (chatsToClose.length === 0) {
      return res.status(404).json({ error: 'No open chats found for this ticketID' });
    }

    for (let chat of chatsToClose) {
      chat.status = 'closed';
      await chat.save();
    }

    io.emit('chatClosed', ticketID);  // Emitir un evento al cerrar un chat

    res.status(200).json({ message: 'Chat closed successfully' });
  } catch (error) {
    console.error('Error closing chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




// Obtener todos los chats

const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.findAll({
      include: [
        {
          model: Contact,
          attributes: ['name'], // Incluye el nombre del contacto
        },
      ],
    });

    // Transformar los datos para incluir `contactName` directamente
    const transformedChats = chats.map(chat => ({
      ...chat.toJSON(),
      contactName: chat.Contact ? chat.Contact.name : 'Sin nombre',
    }));

    console.log('Chats transformados:', JSON.stringify(transformedChats, null, 2)); // Verifica la estructura transformada

    res.status(200).json(transformedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



/*const getOpenChats = async (req, res) => {
  try {
    const openChats = await Chat.findAll({
      where: { status: 'open' },
      include: [{ model: Contact, attributes: ['name', 'phoneNumber'] }], // Incluir el nombre y número del contacto
      order: [['createdAt', 'DSC']],
    });

    const groupedChats = openChats.reduce((acc, chat) => {
      const chatWithContact = {
        ...chat.dataValues,
        contactName: chat.Contact ? chat.Contact.name : 'Sin nombre', // Añadir el nombre del contacto
        contactPhoneNumber: chat.Contact.phoneNumber // Opcional: incluir también el número de teléfono
      };
      if (!acc[chat.ticketID]) {
        acc[chat.ticketID] = [];
      }
      acc[chat.ticketID].push(chatWithContact);
      return acc;
    }, {});

    res.status(200).json(groupedChats);
  } catch (error) {
    console.error('Error fetching open chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getClosedChats = async (req, res) => {
  try {
    const closedChats = await Chat.findAll({
      where: { status: 'closed' },
      include: [{ model: Contact, attributes: ['name', 'phoneNumber'] }],
      order: [['createdAt', 'DSC']],
    });

    const groupedChats = closedChats.reduce((acc, chat) => {
      const chatWithContact = {
        ...chat.dataValues,
        contactName: chat.Contact ? chat.Contact.name : 'Sin nombre', // Añadir el nombre del contacto
        contactPhoneNumber: chat.Contact.phoneNumber // Opcional
      };
      if (!acc[chat.ticketID]) {
        acc[chat.ticketID] = [];
      }
      acc[chat.ticketID].push(chatWithContact);
      return acc;
    }, {});

    res.status(200).json(groupedChats);
  } catch (error) {
    console.error('Error fetching closed chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};*/ 

const getOpenChats = async (req, res) => {
  try {
    const openChats = await Chat.findAll({
      where: { status: 'open' },
      include: [
        {
          model: Contact,
          as: 'Contact', // Asegúrate de usar el alias correcto si lo configuraste
          attributes: ['name', 'phoneNumber'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const groupedChats = openChats.reduce((acc, chat) => {
      const chatWithContact = {
        ...chat.dataValues,
        contactName: chat.Contact ? chat.Contact.name : 'Sin nombre',
        contactPhoneNumber: chat.Contact ? chat.Contact.phoneNumber : 'Sin teléfono',
      };
      if (!acc[chat.ticketID]) {
        acc[chat.ticketID] = [];
      }
      acc[chat.ticketID].push(chatWithContact);
      return acc;
    }, {});

    res.status(200).json(groupedChats);
  } catch (error) {
    console.error('Error fetching open chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getClosedChats = async (req, res) => {
  try {
    const closedChats = await Chat.findAll({
      where: { status: 'closed' },
      include: [
        {
          model: Contact,
          as: 'Contact',
          attributes: ['name', 'phoneNumber'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const groupedChats = closedChats.reduce((acc, chat) => {
      const chatWithContact = {
        ...chat.dataValues,
        contactName: chat.Contact ? chat.Contact.name : 'Sin nombre',
        contactPhoneNumber: chat.Contact ? chat.Contact.phoneNumber : 'Sin teléfono',
      };
      if (!acc[chat.ticketID]) {
        acc[chat.ticketID] = [];
      }
      acc[chat.ticketID].push(chatWithContact);
      return acc;
    }, {});

    res.status(200).json(groupedChats);
  } catch (error) {
    console.error('Error fetching closed chats:', error);
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

// Eliminar chats por ticketID
const deleteChatByTicketID = async (req, res) => {
  try {
    const { ticketID } = req.params;

    const chatsToDelete = await Chat.findAll({
      where: {
        ticketID
      }
    });

    if (chatsToDelete.length === 0) {
      return res.status(404).json({ error: 'No chats found for this ticketID' });
    }

    for (let chat of chatsToDelete) {
      await chat.destroy();
    }

    res.status(200).json({ message: 'Chats deleted successfully' });
  } catch (error) {
    console.error('Error deleting chats:', error);
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
  sendMessageToChat,
  createChat,
  getChatsForContact,
  closeChat,
  getAllChats,
  getOpenChats,   
  getClosedChats,  
  getChatById,
  updateChatStatus,
  deleteChat,
  deleteChatByTicketID
};
