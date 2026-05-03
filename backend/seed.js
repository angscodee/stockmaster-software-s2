require('dotenv').config();
const { sequelize } = require('./config/database');
const Product = require('./models/product');

const seedData = [
  { sku: 'ELE-001', nombre: 'Smartphone Galaxy S23', descripcion: 'Teléfono inteligente de alta gama', categoria: 'Electrónica', precio_compra: 600.00, precio_venta: 899.99, stock_actual: 12, stock_minimo: 5, proveedor: 'Samsung Electronics' },
  { sku: 'ELE-002', nombre: 'Audífonos Bluetooth Noise Cancelling', descripcion: 'Audífonos con cancelación de ruido activa', categoria: 'Electrónica', precio_compra: 120.00, precio_venta: 249.99, stock_actual: 3, stock_minimo: 10, proveedor: 'Sony Corp' },
  { sku: 'ELE-003', nombre: 'Cámara Mirrorless 4K', descripcion: 'Cámara profesional para video y foto', categoria: 'Electrónica', precio_compra: 1100.00, precio_venta: 1599.00, stock_actual: 8, stock_minimo: 5, proveedor: 'Canon Latin' },
  { sku: 'MUE-001', nombre: 'Escritorio Ergonómico', descripcion: 'Escritorio ajustable en altura', categoria: 'Muebles', precio_compra: 150.00, precio_venta: 299.00, stock_actual: 20, stock_minimo: 10, proveedor: 'Office Depot' },
  { sku: 'MUE-002', nombre: 'Silla de Oficina Mesh', descripcion: 'Silla transpirable con soporte lumbar', categoria: 'Muebles', precio_compra: 80.00, precio_venta: 159.00, stock_actual: 4, stock_minimo: 15, proveedor: 'Muebles del Centro' },
  { sku: 'MUE-003', nombre: 'Lámpara de Pie LED', descripcion: 'Iluminación moderna para oficina', categoria: 'Muebles', precio_compra: 25.00, precio_venta: 55.00, stock_actual: 35, stock_minimo: 10, proveedor: 'LightHouse' },
  { sku: 'UTI-001', nombre: 'Set de Marcadores (24 colores)', descripcion: 'Marcadores permanentes punta fina', categoria: 'Útiles', precio_compra: 15.00, precio_venta: 29.50, stock_actual: 50, stock_minimo: 20, proveedor: 'Faber Castell' },
  { sku: 'UTI-002', nombre: 'Cuaderno Profesional Rayado', descripcion: 'Cuaderno de 100 hojas pasta dura', categoria: 'Útiles', precio_compra: 2.50, precio_venta: 6.00, stock_actual: 100, stock_minimo: 50, proveedor: 'Scribe' },
  { sku: 'UTI-003', nombre: 'Calculadora Científica', descripcion: 'Calculadora con funciones avanzadas', categoria: 'Útiles', precio_compra: 18.00, precio_venta: 35.00, stock_actual: 2, stock_minimo: 5, proveedor: 'Casio' },
  { sku: 'ROP-001', nombre: 'Camiseta Algodón Orgánico', descripcion: 'Camiseta básica blanca unisex', categoria: 'Ropa', precio_compra: 8.00, precio_venta: 19.99, stock_actual: 60, stock_minimo: 25, proveedor: 'Textiles Modernos' },
  { sku: 'ROP-002', nombre: 'Chaqueta Impermeable', descripcion: 'Chaqueta ligera para lluvia', categoria: 'Ropa', precio_compra: 35.00, precio_venta: 75.00, stock_actual: 15, stock_minimo: 10, proveedor: 'Outdoor Gear' },
  { sku: 'ROP-003', nombre: 'Pantalones Denim Slim Fit', descripcion: 'Jeans azul clásico para hombre', categoria: 'Ropa', precio_compra: 20.00, precio_venta: 49.90, stock_actual: 8, stock_minimo: 20, proveedor: 'Levi Straus' },
  { sku: 'ALI-001', nombre: 'Café en Grano (1kg)', descripcion: 'Café de altura tostado medio', categoria: 'Alimentos', precio_compra: 12.00, precio_venta: 24.00, stock_actual: 40, stock_minimo: 15, proveedor: 'Café Selecto' },
  { sku: 'ALI-002', nombre: 'Aceite de Oliva Extra Virgen', descripcion: 'Botella de 500ml prensado en frío', categoria: 'Alimentos', precio_compra: 7.50, precio_venta: 14.99, stock_actual: 5, stock_minimo: 10, proveedor: 'Gourmet Imports' },
  { sku: 'ALI-003', nombre: 'Chocolate Amargo 70% Cacao', descripcion: 'Barra de chocolate artesanal', categoria: 'Alimentos', precio_compra: 3.00, precio_venta: 6.50, stock_actual: 120, stock_minimo: 30, proveedor: 'Cacao Real' }
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida con la DB.');

    // Limpiar tabla (destruye registros pero no la tabla en sí)
    await Product.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
    console.log('Tabla de productos limpiada.');

    // Insertar datos
    await Product.bulkCreate(seedData);
    console.log('¡Datos de prueba insertados exitosamente!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error al insertar datos:', error);
    process.exit(1);
  }
};

seed();
