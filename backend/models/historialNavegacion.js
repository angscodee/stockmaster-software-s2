const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HistorialNavegacion = sequelize.define('HistorialNavegacion', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  cliente_id: { type: DataTypes.INTEGER, allowNull: false },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  fecha_visita: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'cli_historial_navegacion',
  timestamps: false
});

module.exports = HistorialNavegacion;
