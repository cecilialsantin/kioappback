const bcrypt = require('bcryptjs');

// Contraseña en texto claro
const plainPassword = 'Pass123';

// Hash almacenado (el que no está funcionando)
const storedHash = '$2a$10$L9IwQH17VA.jz4XSY3SHJ.h6uO9s/ee67NnrSwhA5ay8wpjSsHB9W';

bcrypt.compare(plainPassword, storedHash, (err, isMatch) => {
  if (err) {
    console.error('Error comparando contraseñas:', err);
  } else {
    console.log('¿Las contraseñas coinciden?', isMatch);
  }
});
