const { sequelize } = require('./config/database');

async function getUsers() {
  try {
    const [results] = await sequelize.query(`
      SELECT u.email, r.nombre as rol 
      FROM seg_usuarios u
      JOIN seg_roles r ON u.rol_id = r.id
    `);
    console.log('Usuarios en el sistema:', results);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

getUsers();
