module.exports = (sequelize, DataTypes) => {
    const Chat = sequelize.define('Chat', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      contactId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Contacts', // Aquí debería ser la referencia al modelo Contact importado
          key: 'id'
        }
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      mediaType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      isBotResponse: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      status: {
        type: DataTypes.ENUM('queued', 'sent', 'delivered', 'read', 'failed', 'open', 'closed'),
        defaultValue: 'open'
      },
      messageSid: {
        type: DataTypes.STRING,
        allowNull: true
      }
    });
  
    // Asociaciones
    Chat.associate = function(models) {
      Chat.belongsTo(models.Contact, { foreignKey: 'contactId' });
    };
  
    return Chat;
  };
  