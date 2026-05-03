const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ImagenProducto = sequelize.define('ImagenProducto', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  url: { type: DataTypes.STRING(500), allowNull: false },
  orden: { type: DataTypes.INTEGER, defaultValue: 0 },
  principal: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'cat_imagenes_producto',
  timestamps: false
});

module.exports = ImagenProducto;
