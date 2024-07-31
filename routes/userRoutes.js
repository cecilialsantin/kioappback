
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multerConfig');
const { getAllUsers, getUserProfile, createUser, updateUser, deleteUser, updatePassword } = require('../controllers/userController');
const { authenticateToken, authenticateRole } = require('../middlewares/authMiddleware');

// Ruta para obtener todos los usuarios, accesible solo para superusuarios
router.get('/', authenticateToken, authenticateRole('superuser'), getAllUsers);

// Ruta para obtener el perfil del usuario autenticado
router.get('/profile', authenticateToken, getUserProfile);

// Ruta para crear un nuevo usuario, accesible solo para superusuarios
router.post('/', authenticateToken, authenticateRole('superuser'), upload.single('profileImageUrl'), createUser);

// Ruta para actualizar un usuario
router.put('/:id', authenticateToken, authenticateRole('superuser'), upload.single('profileImageUrl'), updateUser);

// Ruta para eliminar un usuario
router.delete('/:id', authenticateToken, authenticateRole('superuser'), deleteUser);

// Ruta para modificar la contraseña
router.put('/change-password/:id', authenticateToken, updatePassword);

module.exports = router;
