const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost', port: 5432,
  user: 'postgres', password: 'admin123',
  database: 'product_management'
});

async function main() {
  try {
    // 1. Check seg_usuarios
    console.log('=== seg_usuarios ===');
    const users = await pool.query(`SELECT id, email, activo, rol_id FROM seg_usuarios LIMIT 5`);
    console.log(JSON.stringify(users.rows, null, 2));

    // 2. Check roles
    console.log('\n=== seg_roles ===');
    const roles = await pool.query(`SELECT * FROM seg_roles`);
    console.log(JSON.stringify(roles.rows, null, 2));

    // 3. Check Sequelize model mapping - what does the model use?
    console.log('\n=== seg_usuario_rol ===');
    const ur = await pool.query(`SELECT * FROM seg_usuario_rol LIMIT 5`);
    console.log(JSON.stringify(ur.rows, null, 2));

    // 4. Check refresh_tokens table
    console.log('\n=== refresh_tokens table exists? ===');
    const rt = await pool.query(`SELECT COUNT(*) FROM refresh_tokens`).catch(e => ({ rows: [{count: 'ERROR: ' + e.message}]}));
    console.log(JSON.stringify(rt.rows));

    // 5. Products - check one
    console.log('\n=== products sample ===');
    const prods = await pool.query(`SELECT id, nombre, slug FROM products LIMIT 3`);
    console.log(JSON.stringify(prods.rows, null, 2));

    // 6. cat_productos sample  
    console.log('\n=== cat_productos sample ===');
    const cp = await pool.query(`SELECT id, nombre, slug FROM cat_productos LIMIT 3`);
    console.log(JSON.stringify(cp.rows, null, 2));

    // 7. Check what table 'Producto' model maps to
    // Look at inv_stock_producto
    console.log('\n=== inv_stock_producto ===');
    const sp = await pool.query(`SELECT * FROM inv_stock_producto LIMIT 3`);
    console.log(JSON.stringify(sp.rows, null, 2));

    // 8. Get password_hash for admin
    console.log('\n=== admin user password hash ===');
    const admin = await pool.query(`SELECT id, email, password_hash, activo FROM seg_usuarios WHERE email LIKE '%admin%' LIMIT 3`);
    console.log(JSON.stringify(admin.rows, null, 2));

  } catch(e) {
    console.error('Main error:', e.message);
  } finally {
    await pool.end();
  }
}
main();
