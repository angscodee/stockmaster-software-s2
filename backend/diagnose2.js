const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const pool = new Pool({
  host: 'localhost', port: 5432,
  user: 'postgres', password: 'admin123',
  database: 'product_management'
});

async function main() {
  try {
    // 1. Get admin user details  
    console.log('=== Admin user ===');
    const admin = await pool.query(`SELECT id, email, password_hash, nombre, rol_id, activo FROM seg_usuarios WHERE rol_id = 2`);
    console.log(JSON.stringify(admin.rows, null, 2));

    // 2. Verify bcrypt
    if (admin.rows.length > 0) {
      const hash = admin.rows[0].password_hash;
      const test1 = await bcrypt.compare('Admin123!', hash);
      const test2 = await bcrypt.compare('admin123', hash);
      const test3 = await bcrypt.compare('Admin123', hash);
      console.log('\n=== Password tests ===');
      console.log('Admin123! matches:', test1);
      console.log('admin123 matches:', test2);
      console.log('Admin123 matches:', test3);
    }

    // 3. Check the Role model - is seg_roles correct?
    console.log('\n=== seg_roles ===');
    const roles = await pool.query(`SELECT * FROM seg_roles`);
    console.log(JSON.stringify(roles.rows, null, 2));

    // 4. Check inv_stock_producto for product IDs
    console.log('\n=== inv_stock_producto ===');
    const stock = await pool.query(`SELECT * FROM inv_stock_producto LIMIT 5`);
    console.log(JSON.stringify(stock.rows, null, 2));

    // 5. Check cat_productos
    console.log('\n=== cat_productos ===');
    const prods = await pool.query(`SELECT id, sku, nombre, precio_venta, activo FROM cat_productos LIMIT 5`);
    console.log(JSON.stringify(prods.rows, null, 2));

    // 6. Check cat_imagenes_producto
    console.log('\n=== cat_imagenes_producto ===');
    const imgs = await pool.query(`SELECT * FROM cat_imagenes_producto LIMIT 5`);
    console.log(JSON.stringify(imgs.rows, null, 2));

    // 7. Check routes for products - does /api/productos/categorias conflict with /:id ?
    console.log('\n=== cat_categorias ===');
    const cats = await pool.query(`SELECT id, nombre, activo FROM cat_categorias LIMIT 10`);
    console.log(JSON.stringify(cats.rows, null, 2));

    // 8. Auth route - check if register endpoint exists
    console.log('\n=== Check auth routes ===');
    // This will show us what routes are registered
    
  } catch(e) {
    console.error('Main error:', e.message, e.stack);
  } finally {
    await pool.end();
  }
}
main();
