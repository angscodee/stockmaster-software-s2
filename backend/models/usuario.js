const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  password_hash: { type: DataTypes.TEXT, allowNull: false },
  nombre: { type: DataTypes.STRING(80) },
  apellido: { type: DataTypes.STRING(80) },
  rol_id: { type: DataTypes.INTEGER, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'seg_usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Usuario;
