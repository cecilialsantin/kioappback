const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institutionController');
const { authenticateToken, authenticateRole } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, institutionController.getAllInstitutions);
router.get('/:id', authenticateToken, institutionController.getInstitutionById);
router.post('/', authenticateToken, authenticateRole(['superuser', 'admin']), institutionController.createInstitution);
router.put('/:id', authenticateToken, authenticateRole(['superuser', 'admin']), institutionController.updateInstitution);
router.delete('/:id', authenticateToken, authenticateRole(['superuser', 'admin']), institutionController.deleteInstitution);

module.exports = router;
