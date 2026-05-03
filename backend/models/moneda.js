const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Moneda = sequelize.define('Moneda', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  codigo: { type: DataTypes.STRING(3), unique: true, allowNull: false },
  nombre: { type: DataTypes.STRING(30) },
  simbolo: { type: DataTypes.STRING(5) },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'monedas',
  timestamps: false
});

module.exports = Moneda;
