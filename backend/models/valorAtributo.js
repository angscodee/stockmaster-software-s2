const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ValorAtributo = sequelize.define('ValorAtributo', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  atributo_id: { type: DataTypes.INTEGER, allowNull: false },
  valor: { type: DataTypes.STRING(100), allowNull: false }
}, {
  tableName: 'cat_valores_atributo',
  timestamps: false
});

module.exports = ValorAtributo;
