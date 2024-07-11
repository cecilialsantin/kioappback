const { Sequelize } = require('sequelize');
const config = require('./db')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect
});

// Exportar la instancia de Sequelize
module.exports = sequelize;

// Importar y sincronizar todos los modelos
const User = require('./models/userModel');

sequelize.sync()
  .then(() => {
    console.log('Base de datos sincronizada');
  })
  .catch((err) => {
    console.error('Error sincronizando la base de datos:', err);
  });

module.exports = {
  sequelize,
  User
};
