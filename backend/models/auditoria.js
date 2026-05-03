const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Auditoria = sequelize.define('Auditoria', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  usuario_id: { type: DataTypes.INTEGER },
  accion: { type: DataTypes.STRING(20) },
  modulo: { type: DataTypes.STRING(50) },
  tabla_afectada: { type: DataTypes.STRING(50) },
  registro_id: { type: DataTypes.INTEGER },
  datos_anteriores: { type: DataTypes.JSONB },
  datos_nuevos: { type: DataTypes.JSONB },
  ip_address: { type: DataTypes.INET },
  user_agent: { type: DataTypes.TEXT }
}, {
  tableName: 'auditoria_registro',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Auditoria;
