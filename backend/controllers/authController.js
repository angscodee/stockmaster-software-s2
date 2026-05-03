const { Usuario, Role, RefreshToken, Cliente } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await Usuario.findOne({
        where: { email },
        include: [{ model: Role, as: 'rol', attributes: ['nombre'] }]
      });

      if (!user || !user.activo) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.rol.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Save refresh token
      await RefreshToken.create({
        token: refreshToken,
        usuario_id: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            role: user.rol.nombre
          },
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
    }
  },

  async register(req, res) {
    try {
      const { nombre, apellido, email, password } = req.body;

      if (!nombre || !email || !password) {
        return res.status(400).json({ success: false, message: 'Nombre, email y contraseña son requeridos' });
      }

      // Verificar si el email ya existe
      const existing = await Usuario.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'El email ya está registrado' });
      }

      // Hash de contraseña
      const password_hash = await bcrypt.hash(password, 10);

      // Obtener rol 'cliente'
      const rolCliente = await Role.findOne({ where: { nombre: 'cliente' } });
      if (!rolCliente) {
        return res.status(500).json({ success: false, message: 'Rol cliente no encontrado' });
      }

      // Crear usuario
      const user = await Usuario.create({
        nombre,
        apellido: apellido || '',
        email,
        password_hash,
        rol_id: rolCliente.id,
        activo: true
      });

      // Crear perfil de cliente
      await Cliente.create({
        usuario_id: user.id,
        nombre,
        apellido: apellido || '',
        email,
        activo: true
      }).catch(() => {});  // Ignorar si ya existe o falla

      // Generar tokens
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: 'cliente' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      await RefreshToken.create({
        token: refreshToken,
        usuario_id: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      res.status(201).json({
        success: true,
        data: {
          user: { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email, role: 'cliente' },
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al registrar usuario', error: error.message });
    }
  },

  async refreshToken(req, res) {
    try {
      const { token } = req.body;
      if (!token) return res.status(401).json({ success: false, message: 'Token requerido' });

      const storedToken = await RefreshToken.findOne({ where: { token, revocado: false } });
      if (!storedToken) return res.status(403).json({ success: false, message: 'Token inválido' });

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Usuario.findByPk(decoded.id, { include: [{ model: Role, as: 'rol' }] });

      if (!user) return res.status(403).json({ success: false, message: 'Usuario no encontrado' });

      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.rol.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ success: true, accessToken: newAccessToken });
    } catch (error) {
      res.status(403).json({ success: false, message: 'Token expirado o inválido' });
    }
  },

  async logout(req, res) {
    try {
      const { token } = req.body;
      await RefreshToken.update({ revocado: true }, { where: { token } });
      res.json({ success: true, message: 'Sesión cerrada' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
    }
  },

  async updateProfile(req, res) {
    try {
      const { nombre, apellido, telefono } = req.body;
      const user = await Usuario.findByPk(req.user.id);
      
      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

      await user.update({ nombre, apellido, telefono });

      // Si es cliente, actualizar también el perfil de cliente
      if (req.user.role === 'cliente') {
        const cliente = await Cliente.findOne({ where: { usuario_id: user.id } });
        if (cliente) {
          await cliente.update({ nombre, apellido, telefono });
        }
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          telefono: user.telefono,
          role: req.user.role
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al actualizar perfil', error: error.message });
    }
  }
};

module.exports = authController;
