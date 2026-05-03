const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ItemOrden = sequelize.define('ItemOrden', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orden_id: { type: DataTypes.INTEGER, allowNull: false },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  precio_unitario: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(12, 2), readOnly: true },
  variante_seleccionada: { type: DataTypes.JSONB }
}, {
  tableName: 'ord_items_orden',
  timestamps: false
});

module.exports = ItemOrden;
