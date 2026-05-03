const { sequelize } = require('./config/database');

async function checkCounts() {
  try {
    const tables = ['cat_productos', 'cat_categorias', 'cat_marcas', 'seg_usuarios'];
    for (const table of tables) {
      try {
        const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`Table ${table}: ${result[0].count} records`);
      } catch (e) {
        console.log(`Table ${table} error: ${e.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkCounts();
