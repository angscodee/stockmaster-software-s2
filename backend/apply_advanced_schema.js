
const fs = require('fs');
const path = require('path');
const { sequelize } = require('./config/database');

async function applySchema() {
  try {
    const sqlPath = path.join(__dirname, '..', 'database', 'advanced_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolon but be careful with functions/triggers if any
    // For this simple schema, splitting by semicolon is mostly fine
    // However, PostgreSQL can handle the whole script in one query call
    
    console.log('Aplicando esquema avanzado...');
    await sequelize.query(sql);
    console.log('✅ Esquema aplicado exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error aplicando esquema:', error.message);
    process.exit(1);
  }
}

applySchema();
