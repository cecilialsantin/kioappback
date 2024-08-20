const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticateToken, authenticateRole } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, equipmentController.getAllEquipment);
router.get('/:id', authenticateToken, equipmentController.getEquipmentById);
router.post('/', authenticateToken, authenticateRole(['superuser', 'admin']), equipmentController.createEquipment);
router.put('/:id', authenticateToken, authenticateRole(['superuser', 'admin']), equipmentController.updateEquipment);
router.delete('/:id', authenticateToken, authenticateRole(['superuser', 'admin']), equipmentController.deleteEquipment);

module.exports = router;
