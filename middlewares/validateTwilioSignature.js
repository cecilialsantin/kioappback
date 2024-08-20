const twilio = require('twilio');

const validateTwilioSignature = (req, res, next) => {
  const twilioSignature = req.headers['x-twilio-signature'];
  const url = process.env.NGROK_URL + req.originalUrl; // La URL que Twilio firma

  if (!twilioSignature) {
    return res.status(403).send('Signature is missing');
  }

  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN, // El Auth Token de Twilio
    twilioSignature, // La firma que llegó en la solicitud
    url, // La URL completa de la solicitud
    req.body // Los parámetros de la solicitud
  );

  if (isValid) {
    next(); // La firma es válida, continúa con la solicitud
  } else {
    res.status(403).send('Invalid Twilio signature'); // La firma no es válida
  }
};

module.exports = validateTwilioSignature;
