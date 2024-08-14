module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define('Contact', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  // Asociaciones
  Contact.associate = function(models) {
    Contact.hasMany(models.Chat, { foreignKey: 'contactId' });
    Contact.hasMany(models.Equipment, { foreignKey: 'contactId' });
    Contact.belongsToMany(models.Institution, { through: 'InstitutionContacts', foreignKey: 'contactId' });
  };

  return Contact;
};
