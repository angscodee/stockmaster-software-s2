const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ResenaProducto = sequelize.define('ResenaProducto', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  cliente_id: { type: DataTypes.INTEGER },
  calificacion: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
  comentario: { type: DataTypes.TEXT },
  moderado: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'cli_resenas_producto',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ResenaProducto;
