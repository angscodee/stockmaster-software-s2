const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Marca = sequelize.define('Marca', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(80), unique: true, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'cat_marcas',
  timestamps: false
});

module.exports = Marca;
