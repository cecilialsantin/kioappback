/*const { Sequelize, DataTypes } = require('sequelize');

const config = require('./db')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect
});

// Importar y definir los modelos
const User = require('./models/userModel');

module.exports = {
  sequelize,
  User
};*/

const { Sequelize, DataTypes } = require('sequelize');
const config = require('./db')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect
});

// Importar y definir los modelos
const User = require('./models/userModel')(sequelize, DataTypes);

module.exports = {
  sequelize,
  User
};
