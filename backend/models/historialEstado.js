const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HistorialEstado = sequelize.define('HistorialEstado', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orden_id: { type: DataTypes.INTEGER, allowNull: false },
  estado_id: { type: DataTypes.INTEGER, allowNull: false },
  usuario_id: { type: DataTypes.INTEGER },
  comentario: { type: DataTypes.TEXT }
}, {
  tableName: 'ord_historial_estados',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = HistorialEstado;
