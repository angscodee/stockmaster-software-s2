
const { sequelize } = require('./config/database');

async function checkSchema() {
  const tables = ['cat_productos', 'ord_ordenes', 'seg_usuarios', 'inv_stock_producto', 'cli_clientes', 'ord_items_orden', 'inv_movimientos_inventario', 'cat_categorias', 'cat_marcas', 'cat_unidades_medida', 'cat_imagenes_producto', 'ord_estados_orden', 'ord_carritos', 'ord_items_carrito'];
  for (const table of tables) {
    try {
      const [results] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${table}'
      `);
      console.log(`Columns for ${table}:`, results.map(r => r.column_name).join(', '));
    } catch (e) {
      console.error(`Error checking ${table}:`, e.message);
    }
  }
  process.exit();
}

checkSchema();
