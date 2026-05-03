const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Atributo = sequelize.define('Atributo', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(50), unique: true, allowNull: false }
}, {
  tableName: 'cat_atributos',
  timestamps: false
});

module.exports = Atributo;
