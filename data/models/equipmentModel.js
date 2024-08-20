module.exports = (sequelize, DataTypes) => {
    const Equipment = sequelize.define('Equipment', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      contactId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Contacts',
          key: 'id'
        }
      },
      serialNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      }
    });
  
    // Asociaciones
    Equipment.associate = function(models) {
      Equipment.belongsTo(models.Contact, { foreignKey: 'contactId' });
    };
  
    return Equipment;
  };
  


  