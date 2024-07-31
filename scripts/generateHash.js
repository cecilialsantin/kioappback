const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });

console.log(`Ruta del archivo .env: ${path.resolve(__dirname, '../.env.development')}`);
console.log(`SUPERUSER_PASSWORD: ${process.env.SUPERUSER_PASSWORD}`);

(async () => {
  const password = process.env.SUPERUSER_PASSWORD;
  if (!password) {
    console.error('La contraseña del superusuario no está definida en el archivo .env');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`Hashed Password: ${hashedPassword}`); // Guardar el hash para usarlo en la consulta SQL
})();
