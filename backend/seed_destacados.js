const { sequelize, Producto } = require('./models');

async function seedDestacados() {
  try {
    // Marcar los primeros 4 productos como destacados si no hay ninguno
    const [results] = await sequelize.query(`
      UPDATE cat_productos 
      SET destacado = true 
      WHERE id IN (
        SELECT id FROM cat_productos LIMIT 4
      )
    `);
    console.log('✅ Productos marcados como destacados');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

seedDestacados();
