const { Chat, Contact } = require('../data');
const twilio = require('twilio');
const { v4: uuidv4 } = require('uuid');  // Usaremos uuid para generar ticketID único
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

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
    let openChat = await Chat.findOne({
      where: {
        contactId: contact.id,
        status: 'open'
      }
    });

    let ticketID = openChat ? openChat.ticketID : uuidv4(); // Si hay un chat abierto, usamos su ticketID, si no, generamos uno nuevo

    // Crear un nuevo mensaje en la base de datos con el ticketID
    const newMessage = await Chat.create({
      message: messageContent,
      mediaType,
      mediaUrl,
      contactId: contact.id,
      ticketID,  // Asignamos el ticketID al mensaje
      status: 'open',
      isSentByUser: false,  // Indicar que el mensaje fue recibido desde WhatsApp
    });

    return newMessage;

  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
    throw new Error('Internal server error');
  }
};

const sendWhatsAppMessage = async (to, message, mediaUrl = null) => {
  try {

    console.log('Enviando mensaje a Twilio:', to, message); // Log para ver cuántas veces se llama esta función
    // Asegúrate de que el número de destino (to) esté en el formato correcto
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    const messageData = {
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,  // Asegúrate de que este número esté correctamente configurado en tu archivo .env con el prefijo 'whatsapp:'
      to: formattedTo,  // Usa el número de destino formateado con 'whatsapp:'
    };

    if (mediaUrl) {
      messageData.mediaUrl = mediaUrl; // Agrega la URL del medio si está presente
    }

    // Enviar el mensaje usando la API de Twilio
    const response = await client.messages.create(messageData);

    // Devuelve la respuesta de Twilio sin crear un nuevo registro en la base de datos aquí
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
