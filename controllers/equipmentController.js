const { Equipment, Contact } = require('../data');

// Obtener todos los equipos
const getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findAll();
    res.status(200).json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Obtener un equipo por ID
const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.status(200).json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Crear un nuevo equipo
const createEquipment = async (req, res) => {
  try {
    const { contactId, serialNumber, description } = req.body;
    const contact = await Contact.findByPk(contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    const newEquipment = await Equipment.create({ contactId, serialNumber, description });
    res.status(201).json(newEquipment);
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Actualizar un equipo existente
const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { serialNumber, description } = req.body;
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    equipment.serialNumber = serialNumber;
    equipment.description = description;
    await equipment.save();
    res.status(200).json(equipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Eliminar un equipo
const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    await equipment.destroy();
    res.status(200).json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
