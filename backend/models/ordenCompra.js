const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrdenCompra = sequelize.define('OrdenCompra', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  proveedor_id: { type: DataTypes.INTEGER, allowNull: false },
  fecha_orden: { type: DataTypes.DATEONLY },
  fecha_esperada: { type: DataTypes.DATEONLY },
  estado: { type: DataTypes.STRING(20), defaultValue: 'pendiente' },
  total: { type: DataTypes.DECIMAL(12, 2) },
  created_by: { type: DataTypes.INTEGER }
}, {
  tableName: 'inv_ordenes_compra',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = OrdenCompra;
