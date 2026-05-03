const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Proveedor = sequelize.define('Proveedor', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  razon_social: { type: DataTypes.STRING(120), allowNull: false },
  ruc: { type: DataTypes.STRING(20), unique: true },
  email: { type: DataTypes.STRING(100) },
  telefono: { type: DataTypes.STRING(20) },
  direccion: { type: DataTypes.TEXT },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'inv_proveedores',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Proveedor;
