
const { Producto, StockProducto } = require('./models');

async function testCreateProductEmptyPrice() {
  try {
    const data = {
      sku: 'TEST-EMPTY-' + Date.now(),
      nombre: 'Producto Vacio',
      precio_costo: '', // Empty string from frontend
      precio_venta: '20.00',
      categoria_id: 1
    };

    console.log('Tentando crear producto con precio vacio:', data);
    const producto = await Producto.create(data);
    console.log('✅ Producto creado:', producto.id);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testCreateProductEmptyPrice();
