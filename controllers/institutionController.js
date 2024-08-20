const { Institution, Contact } = require('../data');

// Obtener todas las instituciones
const getAllInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.findAll();
    res.status(200).json(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Obtener una institución por ID
const getInstitutionById = async (req, res) => {
  try {
    const { id } = req.params;
    const institution = await Institution.findByPk(id, { include: Contact });
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }
    res.status(200).json(institution);
  } catch (error) {
    console.error('Error fetching institution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Crear una nueva institución
const createInstitution = async (req, res) => {
  try {
    const { name, location, clientCode } = req.body;
    const newInstitution = await Institution.create({ name, location, clientCode });
    res.status(201).json(newInstitution);
  } catch (error) {
    console.error('Error creating institution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Actualizar una institución existente
const updateInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, clientCode } = req.body;
    const institution = await Institution.findByPk(id);
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }
    institution.name = name;
    institution.location = location;
    institution.clientCode = clientCode;
    await institution.save();
    res.status(200).json(institution);
  } catch (error) {
    console.error('Error updating institution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Eliminar una institución
const deleteInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const institution = await Institution.findByPk(id);
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }
    await institution.destroy();
    res.status(200).json({ message: 'Institution deleted successfully' });
  } catch (error) {
    console.error('Error deleting institution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
};
