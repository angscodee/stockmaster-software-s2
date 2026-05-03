const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Producto = sequelize.define('Producto', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  sku: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  nombre: { type: DataTypes.STRING(200), allowNull: false },
  descripcion_corta: { type: DataTypes.STRING(300) },
  descripcion_larga: { type: DataTypes.TEXT },
  categoria_id: { type: DataTypes.INTEGER, allowNull: false },
  marca_id: { type: DataTypes.INTEGER },
  unidad_medida_id: { type: DataTypes.INTEGER },
  precio_costo: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  precio_venta: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  precio_oferta: { type: DataTypes.DECIMAL(12, 2) },
  stock_minimo: { type: DataTypes.INTEGER, defaultValue: 0 },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'cat_productos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Producto;
