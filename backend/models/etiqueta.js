const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Etiqueta = sequelize.define('Etiqueta', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  slug: { type: DataTypes.STRING(60), unique: true, allowNull: false }
}, {
  tableName: 'cat_etiquetas',
  timestamps: false
});

module.exports = Etiqueta;
