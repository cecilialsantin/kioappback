module.exports = (sequelize, DataTypes) => {
    const Institution = sequelize.define('Institution', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customerCode: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      }
    });
  
    // Asociaciones
    Institution.associate = function(models) {
      Institution.belongsToMany(models.Contact, { through: 'InstitutionContacts', foreignKey: 'institutionId' });
    };
  
    return Institution;
  };
  