const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Direccion = sequelize.define('Direccion', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  cliente_id: { type: DataTypes.INTEGER, allowNull: false },
  nombre_completo: { type: DataTypes.STRING(160) },
  direccion_linea1: { type: DataTypes.STRING(200), allowNull: false },
  direccion_linea2: { type: DataTypes.STRING(200) },
  ciudad: { type: DataTypes.STRING(100), allowNull: false },
  departamento: { type: DataTypes.STRING(100) },
  codigo_postal: { type: DataTypes.STRING(20) },
  telefono: { type: DataTypes.STRING(20) },
  principal: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'cli_direcciones',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Direccion;
