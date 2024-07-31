const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../data'); // Asegúrate de que la ruta sea correcta

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Verificar si el usuario existe
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).send('Usuario no encontrado');

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) return res.status(401).send('Contraseña incorrecta');

    // Generar el token JWT
    const token = jwt.sign({ id: user.id, role: user.role  }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, role: user.role, profileImageUrl: user.profileImageUrl, id: user.id});
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).send('Error en el servidor');
  }
};

module.exports = { login };

