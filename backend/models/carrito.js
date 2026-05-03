const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Carrito = sequelize.define('Carrito', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  cliente_id: { type: DataTypes.INTEGER },
  session_id: { type: DataTypes.STRING(100) }
}, {
  tableName: 'ord_carritos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Carrito;
