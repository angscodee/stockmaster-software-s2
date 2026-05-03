
const { Producto, StockProducto } = require('./models');

async function testCreateProduct() {
  try {
    const data = {
      sku: 'TEST-' + Date.now(),
      nombre: 'Producto de Prueba',
      descripcion_corta: 'Esta es una prueba',
      precio_costo: 10.50,
      precio_venta: 20.00,
      stock_minimo: 5,
      categoria_id: 1,
      marca_id: 1,
      unidad_medida_id: 1
    };

    console.log('Tentando crear producto:', data);
    const producto = await Producto.create(data);
    console.log('✅ Producto creado:', producto.id);

    const stock = await StockProducto.create({ producto_id: producto.id, stock_fisico: 0, stock_reservado: 0 });
    console.log('✅ Stock creado:', stock.id);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      error.errors.forEach(e => console.error(' - ', e.message));
    }
    process.exit(1);
  }
}

testCreateProduct();
