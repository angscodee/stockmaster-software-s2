const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DetalleOrdenCompra = sequelize.define('DetalleOrdenCompra', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orden_compra_id: { type: DataTypes.INTEGER, allowNull: false },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  precio_unitario: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
}, {
  tableName: 'inv_detalle_orden_compra',
  timestamps: false
});

module.exports = DetalleOrdenCompra;
