const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contactsController');
const { authenticateToken, authenticateRole } = require('../middlewares/authMiddleware');

// Rutas para manejar contactos
router.get('/', authenticateToken, contactsController.getAllContacts);
router.get('/:id', authenticateToken, contactsController.getContactById);

//router.post('/', authenticateToken, authenticateRole(['superuser', 'admin']), contactsController.createContact);
//router.put('/:id', authenticateToken, authenticateRole(['superuser', 'admin']), contactsController.updateContact);

// Crear o actualizar contacto (con equipos e instituciones)
router.post('/', authenticateToken, contactsController.createOrUpdateContact); 
router.put('/:id', authenticateToken, contactsController.createOrUpdateContact);



router.delete('/:id', authenticateToken, authenticateRole(['superuser', 'admin']), contactsController.deleteContact);

// Obtener un contacto por ID
router.get('/:id', authenticateToken, contactsController.getContactById);

// Obtener equipos asociados a un contacto
router.get('/:contactId/equipment', authenticateToken, contactsController.getContactEquipments);

// Obtener instituciones asociadas a un contacto
router.get('/:contactId/institutions', authenticateToken, contactsController.getContactInstitutions);

module.exports = router;
