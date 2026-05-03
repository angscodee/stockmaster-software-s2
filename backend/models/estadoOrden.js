const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EstadoOrden = sequelize.define('EstadoOrden', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(30), unique: true, allowNull: false },
  codigo: { type: DataTypes.STRING(20), unique: true }
}, {
  tableName: 'ord_estados_orden',
  timestamps: false
});

module.exports = EstadoOrden;
