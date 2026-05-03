const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('Role', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(30), unique: true, allowNull: false },
  descripcion: { type: DataTypes.TEXT }
}, {
  tableName: 'seg_roles',
  timestamps: false
});

module.exports = Role;
