const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ItemCarrito = sequelize.define('ItemCarrito', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  carrito_id: { type: DataTypes.INTEGER, allowNull: false },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  variante_seleccionada: { type: DataTypes.JSONB },
  precio_unitario: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
}, {
  tableName: 'ord_items_carrito',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ItemCarrito;
