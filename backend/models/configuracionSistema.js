const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ConfiguracionSistema = sequelize.define('ConfiguracionSistema', {
  clave: { type: DataTypes.STRING(50), primaryKey: true },
  valor: { type: DataTypes.TEXT },
  descripcion: { type: DataTypes.TEXT },
  actualizado_por: { type: DataTypes.INTEGER }
}, {
  tableName: 'configuracion_sistema',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
});

module.exports = ConfiguracionSistema;
