require('dotenv').config();
const { sequelize } = require('./config/database');
const fs = require('fs');
const path = require('path');

const seedProducts = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida con la DB.');

    const sqlPath = path.join(__dirname, '..', 'database', 'seed_20_products.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Ejecutando inserción de 20 productos avanzados...');
    await sequelize.query(sql);

    console.log('¡Productos avanzados insertados exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la inserción de productos:', error);
    process.exit(1);
  }
};

seedProducts();
