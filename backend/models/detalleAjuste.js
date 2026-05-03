const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DetalleAjuste = sequelize.define('DetalleAjuste', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ajuste_id: { type: DataTypes.INTEGER, allowNull: false },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  tipo_ajuste: { type: DataTypes.ENUM('positivo', 'negativo'), allowNull: false }
}, {
  tableName: 'inv_detalle_ajuste',
  timestamps: false
});

module.exports = DetalleAjuste;
