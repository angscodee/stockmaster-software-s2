require('dotenv').config();
const { sequelize } = require('./config/database');
const fs = require('fs');
const path = require('path');

const migrate = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida con la DB.');

    const sqlPath = path.join(__dirname, '..', 'database', 'advanced_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Ejecutando migración avanzada...');
    
    // Sequelize query interface can execute raw SQL
    // We split by semicolon to execute one by one if needed, but for simple schemas raw query is fine
    await sequelize.query(sql);

    console.log('¡Migración avanzada completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  }
};

migrate();
