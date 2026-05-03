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

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  password_hash: { type: DataTypes.TEXT, allowNull: false },
  nombre: { type: DataTypes.STRING(80) },
  apellido: { type: DataTypes.STRING(80) },
  rol_id: { type: DataTypes.INTEGER, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'seg_usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  slug: { type: DataTypes.STRING(120), unique: true, allowNull: false },
  padre_id: { type: DataTypes.INTEGER },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'cat_categorias',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Brand = sequelize.define('Brand', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(80), unique: true, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'cat_marcas',
  timestamps: false
});

const Unit = sequelize.define('Unit', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  abreviatura: { type: DataTypes.STRING(5) }
}, {
  tableName: 'cat_unidades_medida',
  timestamps: false
});

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  sku: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  nombre: { type: DataTypes.STRING(200), allowNull: false },
  descripcion_corta: { type: DataTypes.STRING(300) },
  descripcion_larga: { type: DataTypes.TEXT },
  categoria_id: { type: DataTypes.INTEGER, allowNull: false },
  marca_id: { type: DataTypes.INTEGER },
  unidad_medida_id: { type: DataTypes.INTEGER },
  precio_costo: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  precio_venta: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  precio_oferta: { type: DataTypes.DECIMAL(12, 2) },
  stock_minimo: { type: DataTypes.INTEGER, defaultValue: 0 },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'cat_productos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const ProductStock = sequelize.define('ProductStock', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  producto_id: { type: DataTypes.INTEGER, unique: true, allowNull: false },
  stock_fisico: { type: DataTypes.INTEGER, defaultValue: 0 },
  stock_reservado: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'inv_stock_producto',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
});

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

const Supplier = sequelize.define('Supplier', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  razon_social: { type: DataTypes.STRING(120), allowNull: false },
  ruc: { type: DataTypes.STRING(20), unique: true },
  email: { type: DataTypes.STRING(100) },
  telefono: { type: DataTypes.STRING(20) },
  direccion: { type: DataTypes.TEXT },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'inv_proveedores',
  timestamps: false
});

// Relaciones
User.belongsTo(Role, { foreignKey: 'rol_id' });
Product.belongsTo(Category, { foreignKey: 'categoria_id', as: 'categoria' });
Product.belongsTo(Brand, { foreignKey: 'marca_id', as: 'marca' });
Product.belongsTo(Unit, { foreignKey: 'unidad_medida_id', as: 'unidad' });
Product.hasOne(ProductStock, { foreignKey: 'producto_id', as: 'stock' });
ProductStock.belongsTo(Product, { foreignKey: 'producto_id' });
Category.hasMany(Product, { foreignKey: 'categoria_id' });
Category.belongsTo(Category, { foreignKey: 'padre_id', as: 'padre' });
RefreshToken.belongsTo(User, { foreignKey: 'usuario_id' });
User.hasMany(RefreshToken, { foreignKey: 'usuario_id' });

module.exports = { Role, User, Category, Brand, Unit, Product, ProductStock, Supplier, RefreshToken, sequelize };
