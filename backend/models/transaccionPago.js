const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TransaccionPago = sequelize.define('TransaccionPago', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  pago_id: { type: DataTypes.INTEGER, allowNull: false },
  transaccion_id: { type: DataTypes.STRING(100), unique: true },
  gateway_respuesta: { type: DataTypes.JSONB }
}, {
  tableName: 'ord_transacciones_pago',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = TransaccionPago;
