// backend/models/index.js 
// Registro central de todos los modelos y sus asociaciones 

const { sequelize } = require('../config/database'); 

const Usuario = require('./usuario'); 
const Role = require('./role'); 
const RefreshToken = require('./refreshToken'); 
const Categoria = require('./categoria'); 
const Marca = require('./marca'); 
const UnidadMedida = require('./unidadMedida'); 
const Producto = require('./producto'); 
const ImagenProducto = require('./imagenProducto'); 
const Etiqueta = require('./etiqueta');
const Atributo = require('./atributo');
const ValorAtributo = require('./valorAtributo');
const Cliente = require('./cliente'); 
const Direccion = require('./direccion'); 
const ResenaProducto = require('./resenaProducto');
const HistorialNavegacion = require('./historialNavegacion');
const EstadoOrden = require('./estadoOrden'); 
const MetodoEnvio = require('./metodoEnvio'); 
const Carrito = require('./carrito'); 
const ItemCarrito = require('./itemCarrito'); 
const Orden = require('./orden'); 
const ItemOrden = require('./itemOrden'); 
const HistorialEstado = require('./historialEstado'); 
const Pago = require('./pago'); 
const TransaccionPago = require('./transaccionPago');
const StockProducto = require('./stockProducto'); 
const MovimientoInventario = require('./movimientoInventario'); 
const Ajuste = require('./ajuste');
const DetalleAjuste = require('./detalleAjuste');
const Proveedor = require('./proveedor'); 
const OrdenCompra = require('./ordenCompra'); 
const DetalleOrdenCompra = require('./detalleOrdenCompra');
const Recepcion = require('./recepcion');
const Moneda = require('./moneda');
const TipoCambio = require('./tipoCambio');
const ConfiguracionSistema = require('./configuracionSistema');
const Auditoria = require('./auditoria'); 

// ======================== 
// ASOCIACIONES 
// ======================== 

// Roles y Usuarios 
Role.hasMany(Usuario, { foreignKey: 'rol_id', as: 'usuarios' }); 
Usuario.belongsTo(Role, { foreignKey: 'rol_id', as: 'rol' }); 

// Refresh Tokens 
Usuario.hasMany(RefreshToken, { foreignKey: 'usuario_id', as: 'refreshTokens' }); 
RefreshToken.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' }); 

// Categorías (auto-referencial) 
Categoria.hasMany(Categoria, { foreignKey: 'padre_id', as: 'subcategorias' }); 
Categoria.belongsTo(Categoria, { foreignKey: 'padre_id', as: 'padre' }); 

// Productos 
Categoria.hasMany(Producto, { foreignKey: 'categoria_id', as: 'productos' }); 
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' }); 

Marca.hasMany(Producto, { foreignKey: 'marca_id', as: 'productos' }); 
Producto.belongsTo(Marca, { foreignKey: 'marca_id', as: 'marca' }); 

Producto.hasMany(ImagenProducto, { foreignKey: 'producto_id', as: 'imagenes' }); 
ImagenProducto.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' }); 

// Etiquetas
Producto.belongsToMany(Etiqueta, { through: 'cat_producto_etiqueta', foreignKey: 'producto_id', as: 'etiquetas' });
Etiqueta.belongsToMany(Producto, { through: 'cat_producto_etiqueta', foreignKey: 'etiqueta_id', as: 'productos' });

// Atributos
Atributo.hasMany(ValorAtributo, { foreignKey: 'atributo_id', as: 'valores' });
ValorAtributo.belongsTo(Atributo, { foreignKey: 'atributo_id', as: 'atributo' });
Producto.belongsToMany(ValorAtributo, { through: 'cat_producto_atributo', foreignKey: 'producto_id', as: 'atributos' });
ValorAtributo.belongsToMany(Producto, { through: 'cat_producto_atributo', foreignKey: 'valor_atributo_id', as: 'productos' });

// Stock 
Producto.hasOne(StockProducto, { foreignKey: 'producto_id', as: 'stock' }); 
StockProducto.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' }); 

// Movimientos 
Producto.hasMany(MovimientoInventario, { foreignKey: 'producto_id', as: 'movimientos' }); 
MovimientoInventario.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' }); 

// Ajustes
Ajuste.hasMany(DetalleAjuste, { foreignKey: 'ajuste_id', as: 'detalles' });
DetalleAjuste.belongsTo(Ajuste, { foreignKey: 'ajuste_id', as: 'ajuste' });
DetalleAjuste.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

// Cliente y Direcciones 
Usuario.hasOne(Cliente, { foreignKey: 'usuario_id', as: 'cliente' });
Cliente.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Cliente.hasMany(Direccion, { foreignKey: 'cliente_id', as: 'direcciones' }); 
Direccion.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' }); 

// Reseñas e Historial
Producto.hasMany(ResenaProducto, { foreignKey: 'producto_id', as: 'resenas' });
ResenaProducto.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
Cliente.hasMany(ResenaProducto, { foreignKey: 'cliente_id', as: 'resenas' });
ResenaProducto.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

Cliente.hasMany(HistorialNavegacion, { foreignKey: 'cliente_id', as: 'historial' });
HistorialNavegacion.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Producto.hasMany(HistorialNavegacion, { foreignKey: 'producto_id', as: 'vistoEnHistorial' });
HistorialNavegacion.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

// Carrito 
Cliente.hasMany(Carrito, { foreignKey: 'cliente_id', as: 'carritos' }); 
Carrito.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' }); 

Carrito.hasMany(ItemCarrito, { foreignKey: 'carrito_id', as: 'items' }); 
ItemCarrito.belongsTo(Carrito, { foreignKey: 'carrito_id', as: 'carrito' }); 
ItemCarrito.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' }); 

// Órdenes 
Cliente.hasMany(Orden, { foreignKey: 'cliente_id', as: 'ordenes' }); 
Orden.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' }); 

EstadoOrden.hasMany(Orden, { foreignKey: 'estado_id', as: 'ordenes' }); 
Orden.belongsTo(EstadoOrden, { foreignKey: 'estado_id', as: 'estado' }); 

MetodoEnvio.hasMany(Orden, { foreignKey: 'metodo_envio_id', as: 'ordenes' }); 
Orden.belongsTo(MetodoEnvio, { foreignKey: 'metodo_envio_id', as: 'metodoEnvio' }); 

Orden.hasMany(ItemOrden, { foreignKey: 'orden_id', as: 'items' }); 
ItemOrden.belongsTo(Orden, { foreignKey: 'orden_id', as: 'orden' }); 
ItemOrden.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' }); 

Orden.hasMany(HistorialEstado, { foreignKey: 'orden_id', as: 'historial' }); 
HistorialEstado.belongsTo(EstadoOrden, { foreignKey: 'estado_id', as: 'estado' });
Orden.hasMany(Pago, { foreignKey: 'orden_id', as: 'pagos' }); 

// Pagos y Transacciones
Pago.hasMany(TransaccionPago, { foreignKey: 'pago_id', as: 'transacciones' });
TransaccionPago.belongsTo(Pago, { foreignKey: 'pago_id', as: 'pago' });

// Proveedores y Órdenes de compra 
Proveedor.hasMany(OrdenCompra, { foreignKey: 'proveedor_id', as: 'ordenesCompra' }); 
OrdenCompra.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' }); 

OrdenCompra.hasMany(DetalleOrdenCompra, { foreignKey: 'orden_compra_id', as: 'detalles' });
DetalleOrdenCompra.belongsTo(OrdenCompra, { foreignKey: 'orden_compra_id', as: 'ordenCompra' });
DetalleOrdenCompra.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

OrdenCompra.hasMany(Recepcion, { foreignKey: 'orden_compra_id', as: 'recepciones' });
Recepcion.belongsTo(OrdenCompra, { foreignKey: 'orden_compra_id', as: 'ordenCompra' });

// Monedas
Moneda.hasMany(TipoCambio, { foreignKey: 'moneda_origen_id', as: 'tasasOrigen' });
Moneda.hasMany(TipoCambio, { foreignKey: 'moneda_destino_id', as: 'tasasDestino' });

module.exports = { 
  sequelize, 
  Usuario, Role, RefreshToken, 
  Categoria, Marca, UnidadMedida, Producto, ImagenProducto, Etiqueta, Atributo, ValorAtributo,
  Cliente, Direccion, ResenaProducto, HistorialNavegacion,
  EstadoOrden, MetodoEnvio, Carrito, ItemCarrito, 
  Orden, ItemOrden, HistorialEstado, Pago, TransaccionPago,
  StockProducto, MovimientoInventario, Ajuste, DetalleAjuste, Proveedor, OrdenCompra, DetalleOrdenCompra, Recepcion,
  Moneda, TipoCambio, ConfiguracionSistema,
  Auditoria, 
};
