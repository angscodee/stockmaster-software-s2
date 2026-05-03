const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cliente = sequelize.define('Cliente', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  usuario_id: { type: DataTypes.INTEGER, unique: true, allowNull: false },
  telefono: { type: DataTypes.STRING(20) },
  puntos_acumulados: { type: DataTypes.INTEGER, defaultValue: 0 },
  nivel: { type: DataTypes.STRING(20), defaultValue: 'bronce' },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'cli_clientes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Cliente;
