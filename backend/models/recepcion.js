const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Recepcion = sequelize.define('Recepcion', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orden_compra_id: { type: DataTypes.INTEGER, allowNull: false },
  fecha_recepcion: { type: DataTypes.DATEONLY },
  usuario_id: { type: DataTypes.INTEGER },
  observaciones: { type: DataTypes.TEXT }
}, {
  tableName: 'inv_recepciones',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Recepcion;
