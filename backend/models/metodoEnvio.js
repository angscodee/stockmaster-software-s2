const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MetodoEnvio = sequelize.define('MetodoEnvio', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(50), allowNull: false },
  costo: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  tiempo_estimado_dias: { type: DataTypes.INTEGER },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'ord_metodos_envio',
  timestamps: false
});

module.exports = MetodoEnvio;
