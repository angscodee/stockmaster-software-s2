const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UnidadMedida = sequelize.define('UnidadMedida', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  abreviatura: { type: DataTypes.STRING(5) }
}, {
  tableName: 'cat_unidades_medida',
  timestamps: false
});

module.exports = UnidadMedida;
