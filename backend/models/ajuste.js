const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ajuste = sequelize.define('Ajuste', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  codigo: { type: DataTypes.STRING(20), unique: true },
  motivo: { type: DataTypes.STRING(100) },
  usuario_id: { type: DataTypes.INTEGER },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'inv_ajustes',
  timestamps: false
});

module.exports = Ajuste;
