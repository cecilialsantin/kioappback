const { Chat, Contact } = require('../data');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

/*const processWhatsAppMessage = async (body) => {
  console.log('Webhook received:', body); // Esto te mostrará todo el cuerpo del mensaje recibido
  try {
    // Usar los campos correctos del cuerpo del webhook
    const contactPhoneNumber = body.WaId || body.From.replace('whatsapp:', ''); // Usar WaId o From
    const messageContent = body.Body || ''; // Usar el campo Body para el contenido del mensaje
    const mediaType = body.MessageType || 'text'; // El tipo de mensaje está en MessageType
    const mediaUrl = body.MediaUrl0 || null; // Esto dependerá de cómo llegue la media

    // Verificar si el contacto ya existe
    let contact = await Contact.findOne({ where: { phoneNumber: contactPhoneNumber } });
    if (!contact) {
      // Crear un nuevo contacto si no existe
      contact = await Contact.create({ phoneNumber: contactPhoneNumber, name: body.ProfileName });
    }

    // Crear un nuevo chat con la información recibida
    const newChat = await Chat.create({
      message: messageContent,
      mediaType,
      mediaUrl,
      contactId: contact.id,
      status: 'open'
    });

    // Emitir el evento de nuevo mensaje usando socket.io
    const io = require('../server').io;
    io.emit('newMessage', newChat);
    //console.log('Nuevo mensaje emitido a través de Socket.IO:', newChat); // Log para verificar la emisión


    return newChat;
  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
    throw new Error('Internal server error');
  }
};*/ 

const processWhatsAppMessage = async (body) => {
  console.log('Webhook received:', body);
  try {
    const contactPhoneNumber = body.WaId || body.From.replace('whatsapp:', '');
    const messageContent = body.Body || '';
    const mediaType = body.MessageType || 'text';
    const mediaUrl = body.MediaUrl0 || null;

    let contact = await Contact.findOne({ where: { phoneNumber: contactPhoneNumber } });
    if (!contact) {
      contact = await Contact.create({ phoneNumber: contactPhoneNumber, name: body.ProfileName });
    }

    // Buscar un chat abierto existente para este contacto
    let chat = await Chat.findOne({
      where: {
        contactId: contact.id,
        status: 'open'
      }
    });

    if (!chat) {
      // Si no existe un chat abierto, crear uno nuevo
      chat = await Chat.create({
        message: messageContent,
        mediaType,
        mediaUrl,
        contactId: contact.id,
        status: 'open'
      });
    } else {
      // Si existe un chat abierto, agregar la respuesta al mismo chat
      chat.message += `\n${messageContent}`;
      if (mediaUrl) {
        chat.mediaUrl = mediaUrl;
        chat.mediaType = mediaType;
      }
      await chat.save();
    }

    return chat;
  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
    throw new Error('Internal server error');
  }
};


const sendWhatsAppMessage = async (to, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`
    });
    return response;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw new Error('Internal server error');
  }
};

const verifyWhatsAppWebhookService = (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Verification token mismatch');
    }
  } else {
    res.status(400).send('Missing verification parameters');
  }
};

module.exports = {
  processWhatsAppMessage,
  sendWhatsAppMessage,
  verifyWhatsAppWebhookService
};
