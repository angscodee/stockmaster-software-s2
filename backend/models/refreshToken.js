const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RefreshToken = sequelize.define('RefreshToken', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  token: { type: DataTypes.TEXT, unique: true, allowNull: false },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  revocado: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'refresh_tokens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = RefreshToken;
