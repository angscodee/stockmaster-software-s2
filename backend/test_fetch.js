
const { Producto, Categoria, Marca, StockProducto } = require('./models');

async function testFetch() {
  try {
    console.log('Fetching products...');
    const { count, rows } = await Producto.findAndCountAll({
      include: [
        { model: Categoria, as: 'categoria', attributes: ['nombre'] },
        { model: Marca, as: 'marca', attributes: ['nombre'] },
        { model: StockProducto, as: 'stock' }
      ]
    });
    console.log(`Success! Found ${count} products.`);
    if (rows.length > 0) {
      console.log('Sample product:', JSON.stringify(rows[0], null, 2));
    }
  } catch (error) {
    console.error('Error fetching products:', error.message);
    if (error.parent) console.error('Parent error:', error.parent.message);
  } finally {
    process.exit();
  }
}

testFetch();
