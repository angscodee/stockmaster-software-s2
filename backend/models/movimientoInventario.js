const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MovimientoInventario = sequelize.define('MovimientoInventario', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.STRING(20), allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  motivo: { type: DataTypes.STRING(100) },
  orden_venta_id: { type: DataTypes.INTEGER },
  orden_compra_id: { type: DataTypes.INTEGER },
  usuario_id: { type: DataTypes.INTEGER }
}, {
  tableName: 'inv_movimientos_inventario',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = MovimientoInventario;
