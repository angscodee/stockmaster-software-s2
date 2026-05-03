const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TipoCambio = sequelize.define('TipoCambio', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  moneda_origen_id: { type: DataTypes.INTEGER, allowNull: false },
  moneda_destino_id: { type: DataTypes.INTEGER, allowNull: false },
  tasa: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
  fecha: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }
}, {
  tableName: 'tipo_cambio',
  timestamps: false
});

module.exports = TipoCambio;
