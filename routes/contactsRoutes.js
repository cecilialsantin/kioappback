const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contactsController');
const { authenticateToken, authenticateRole } = require('../middlewares/authMiddleware');

// Rutas para manejar contactos
router.get('/', authenticateToken, contactsController.getAllContacts);
router.get('/:id', authenticateToken, contactsController.getContactById);
router.post('/', authenticateToken, authenticateRole(['superuser', 'admin']), contactsController.createContact);
router.put('/:id', authenticateToken, authenticateRole(['superuser', 'admin']), contactsController.updateContact);
router.delete('/:id', authenticateToken, authenticateRole(['superuser', 'admin']), contactsController.deleteContact);

module.exports = router;
