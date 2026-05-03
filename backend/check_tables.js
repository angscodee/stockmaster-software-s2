const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'admin123',
  database: 'product_management'
});

async function main() {
  try {
    const tables = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
    console.log('=== TABLES ===');
    console.log(tables.rows.map(x => x.table_name).join('\n'));

    // Try to get users
    try {
      const users = await pool.query(`SELECT id, email, rol, activo FROM "Users" LIMIT 5`);
      console.log('\n=== USERS (Users table) ===');
      console.log(JSON.stringify(users.rows, null, 2));
    } catch (e) {
      console.log('\nNo "Users" table or error:', e.message);
    }

    // Try alternative
    for (const name of ['users', 'Usuarios', 'usuarios', 'clientes', 'Clientes']) {
      try {
        const r = await pool.query(`SELECT id, email FROM "${name}" LIMIT 2`);
        console.log(`\n=== ${name} table ===`);
        console.log(JSON.stringify(r.rows));
      } catch(e) {}
    }

    // Count products
    for (const name of ['Products', 'products', 'Productos', 'productos']) {
      try {
        const r = await pool.query(`SELECT COUNT(*) FROM "${name}"`);
        console.log(`\n${name} count: ${r.rows[0].count}`);
      } catch(e) {}
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}
main();
