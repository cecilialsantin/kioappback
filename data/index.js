const { Sequelize, DataTypes } = require('sequelize');
const config = require('./db')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect
});

// Importar y definir los modelos
const User = require('./models/userModel')(sequelize, DataTypes);
const Contact = require('./models/contactModel')(sequelize, DataTypes);
const Institution = require('./models/institutionModel')(sequelize, DataTypes);
const Chat = require('./models/chatModel')(sequelize, DataTypes);
const Equipment = require('./models/equipmentModel')(sequelize, DataTypes);

// Asociaciones

Contact.associate({ Chat, Institution, Equipment });
Institution.associate({ Contact });
Chat.associate({ Contact });
Equipment.associate({ Contact });

module.exports = {
  sequelize,
  User,
  Contact,
  Institution,
  Chat,
  Equipment
};
