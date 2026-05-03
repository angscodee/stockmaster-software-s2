const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockProducto = sequelize.define('StockProducto', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  producto_id: { type: DataTypes.INTEGER, unique: true, allowNull: false },
  stock_fisico: { type: DataTypes.INTEGER, defaultValue: 0 },
  stock_reservado: { type: DataTypes.INTEGER, defaultValue: 0 },
  stock_disponible: {
    type: DataTypes.VIRTUAL,
    get() {
      return (this.stock_fisico || 0) - (this.stock_reservado || 0);
    }
  }
}, {
  tableName: 'inv_stock_producto',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
});

module.exports = StockProducto;
