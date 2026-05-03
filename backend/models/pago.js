const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pago = sequelize.define('Pago', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orden_id: { type: DataTypes.INTEGER, allowNull: false },
  monto: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  metodo_pago: { type: DataTypes.STRING(50) },
  referencia: { type: DataTypes.STRING(100) },
  estado: { type: DataTypes.STRING(20), defaultValue: 'pendiente' },
  fecha_pago: { type: DataTypes.DATE }
}, {
  tableName: 'ord_pagos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Pago;
