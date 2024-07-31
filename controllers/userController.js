
const { User } = require('../data');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).send('Error en el servidor');
  }
};

//Obtener un usuario
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; 
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] } // Excluir el campo de contraseña por seguridad
    });
    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.json(user);
  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    res.status(500).send('Error en el servidor');
  }
};

//Crear un usuario
const createUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  let profileImageUrl = '';

  if (req.file) {
    profileImageUrl = `/uploads/${req.file.filename}`;
  }

  try {
    if (!password) {
      return res.status(400).send('La contraseña es requerida');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    if (!hashedPassword) {
      throw new Error('Error al hashear la contraseña');
    }

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      profileImageUrl
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).send('Error en el servidor');
  }
};

// Función para actualizar un usuario existente
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;
  let profileImageUrl;

  // Verificar si se ha subido una imagen nueva
  if (req.file) {
    profileImageUrl = `/uploads/${req.file.filename}`;
  }

  try {
    // Buscar el usuario por ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }

    // Actualizar los campos del usuario
    user.username = username || user.username;
    user.email = email || user.email;
    
    // Solo hashear la contraseña si se proporciona una nueva
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    
    user.role = role || user.role;
    if (profileImageUrl) {
      user.profileImageUrl = profileImageUrl;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).send('Error en el servidor');
  }
};

// Función para eliminar un usuario existente
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar el usuario por ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }

    // Eliminar el usuario
    await user.destroy();
    res.status(200).send('Usuario eliminado exitosamente');
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).send('Error en el servidor');
  }
};

//Funcion para modificar la contraseña

const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    // Buscar el usuario por ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }

    // Verificar la contraseña actual (opcional pero recomendado)
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) return res.status(401).send('Contraseña actual incorrecta');

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña en la base de datos
    user.password = hashedPassword;
    await user.save();

    res.status(200).send('Contraseña actualizada exitosamente');
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    res.status(500).send('Error en el servidor');
  }
};

module.exports = {
  getAllUsers,
  getUserProfile,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
};

