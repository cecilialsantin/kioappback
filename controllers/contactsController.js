
const { Contact, Equipment, Institution } = require('../data');


// Obtener todos los contactos
/*const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      attributes: ['id', 'name', 'phoneNumber', 'email', 'position'], // Incluye los atributos necesarios
    });
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};*/ 

const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      attributes: ['id', 'name', 'phoneNumber', 'email', 'position'], // Incluye los atributos necesarios
      include: [
        { model: Equipment }, // Incluye equipos
        { model: Institution } // Incluye instituciones
      ]
    });
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Error fetching contacts' });
  }
};


// Obtener un contacto por ID
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByPk(id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(200).json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Obtener equipos asociados a un contacto
const getContactEquipments = async (req, res) => {
  const { contactId } = req.params;
  const equipments = await Equipment.findAll({ where: { contactId } });
  res.json(equipments);
};

// Obtener instituciones asociadas a un contacto
const getContactInstitutions = async (req, res) => {
  const { contactId } = req.params;
  const institutions = await Institution.findAll({
    include: {
      model: Contact,
      where: { id: contactId }
    }
  });
  res.json(institutions);
};

/*const createOrUpdateContact = async (req, res) => {
  const { name, phoneNumber, email, position, equipments, institutions } = req.body;
  let contact;

  try {
    if (req.params.id) {
      // Actualizar contacto
      contact = await Contact.findByPk(req.params.id);
      if (!contact) {
        return res.status(404).json({ message: 'Contacto no encontrado' });
      }
      await contact.update({ name, phoneNumber, email, position });
    } else {
      // Crear nuevo contacto
      contact = await Contact.create({ name, phoneNumber, email, position });
    }

    // Guardar equipos asociados al contacto
    if (equipments && equipments.length > 0) {
      await Equipment.destroy({ where: { contactId: contact.id } });
      const newEquipments = equipments.map(eq => ({
        contactId: contact.id,
        serialNumber: eq.serialNumber,
        description: eq.description
      }));
      await Equipment.bulkCreate(newEquipments);
    }

    // Guardar instituciones asociadas al contacto
    if (institutions && institutions.length > 0) {
      const institutionPromises = institutions.map(async (inst) => {
        let institution;
        if (inst.id) {
          // Si ya existe la institución, actualízala
          institution = await Institution.findByPk(inst.id);
          if (institution) {
            await institution.update({ name: inst.name, location: inst.location, customerCode: inst.customerCode });
          }
        } else {
          // Si no existe, créala
          institution = await Institution.create({ name: inst.name, location: inst.location, customerCode: inst.customerCode });
        }
        return institution;
      });

      const institutionInstances = await Promise.all(institutionPromises);
      const institutionIds = institutionInstances.map(inst => inst.id);
      await contact.setInstitutions(institutionIds); // Asociar los IDs correctamente
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar el contacto' });
  }
};*/ 

const createOrUpdateContact = async (req, res) => {
  const { name, phoneNumber, email, position, equipments, institutions } = req.body;
  let contact;

  try {
    if (req.params.id) {
      // Actualizar contacto
      contact = await Contact.findByPk(req.params.id);
      if (!contact) {
        return res.status(404).json({ message: 'Contacto no encontrado' });
      }
      await contact.update({ name, phoneNumber, email, position });
    } else {
      // Crear nuevo contacto
      contact = await Contact.create({ name, phoneNumber, email, position });
    }

    // Guardar equipos asociados al contacto
    if (equipments && equipments.length > 0) {
      const equipmentPromises = equipments.map(async (eq) => {
        let equipment;
        if (eq.id) {
          // Si el equipo tiene ID, actualizarlo
          equipment = await Equipment.findByPk(eq.id);
          if (equipment) {
            await equipment.update({ serialNumber: eq.serialNumber, description: eq.description });
          }
        } else {
          // Si no tiene ID, crearlo
          equipment = await Equipment.create({ contactId: contact.id, serialNumber: eq.serialNumber, description: eq.description });
        }
        return equipment;
      });

      await Promise.all(equipmentPromises); // Ejecutar todas las promesas de equipos
    }

    // Guardar instituciones asociadas al contacto
    if (institutions && institutions.length > 0) {
      const institutionPromises = institutions.map(async (inst) => {
        let institution;
        if (inst.id) {
          // Si la institución tiene ID, actualizarla
          institution = await Institution.findByPk(inst.id);
          if (institution) {
            await institution.update({ name: inst.name, location: inst.location, customerCode: inst.customerCode });
          }
        } else {
          // Si no tiene ID, crearla
          institution = await Institution.create({ name: inst.name, location: inst.location, customerCode: inst.customerCode });
        }
        return institution;
      });

      const institutionInstances = await Promise.all(institutionPromises);
      const institutionIds = institutionInstances.map(inst => inst.id);
      await contact.setInstitutions(institutionIds); // Asociar instituciones al contacto
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar el contacto' });
  }
};






// Crear un nuevo contacto
const createContact = async (req, res) => {
  try {
    const { name, phoneNumber, email, position } = req.body;
    const newContact = await Contact.create({ name, phoneNumber, email, position });
    res.status(201).json(newContact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Actualizar un contacto existente
const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, email, position } = req.body;
    const contact = await Contact.findByPk(id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    contact.name = name;
    contact.phoneNumber = phoneNumber;
    contact.email = email;
    contact.position = position;
    await contact.save();
    res.status(200).json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Eliminar un contacto
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByPk(id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    await contact.destroy();
    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  getContactEquipments,
  getContactInstitutions,
  createOrUpdateContact,
  createContact,
  updateContact,
  deleteContact,
};
