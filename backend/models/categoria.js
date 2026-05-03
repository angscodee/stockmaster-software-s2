const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Categoria = sequelize.define('Categoria', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  slug: { type: DataTypes.STRING(120), unique: true, allowNull: false },
  padre_id: { type: DataTypes.INTEGER },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'cat_categorias',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Categoria;
