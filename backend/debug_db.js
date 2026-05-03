
const { sequelize } = require('./config/database');

async function debug() {
  try {
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables in public schema:', results.map(r => r.table_name));
    
    const [fks] = await sequelize.query(`
      SELECT conname, confrelid::regclass as referenced_table
      FROM pg_constraint 
      WHERE conrelid = 'cli_clientes'::regclass AND contype = 'f'
    `);
    console.log('Foreign Keys for cli_clientes:', fks);

  } catch (error) {
    console.error('Error debugging:', error.message);
  } finally {
    process.exit();
  }
}

debug();
