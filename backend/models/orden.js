const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Orden = sequelize.define('Orden', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  codigo: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  cliente_id: { type: DataTypes.INTEGER, allowNull: false },
  estado_id: { type: DataTypes.INTEGER, allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  impuestos: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  direccion_envio_id: { type: DataTypes.INTEGER },
  metodo_envio_id: { type: DataTypes.INTEGER },
  metodo_pago: { type: DataTypes.STRING(50) },
  pago_referencia: { type: DataTypes.STRING(100) },
  fecha_orden: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  fecha_pago: { type: DataTypes.DATE },
  fecha_envio: { type: DataTypes.DATE },
  fecha_entrega: { type: DataTypes.DATE },
  notas: { type: DataTypes.TEXT }
}, {
  tableName: 'ord_ordenes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Orden;
