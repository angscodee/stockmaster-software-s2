const { sequelize } = require('./config/database');

const checkDb = async () => {
  try {
    const [tables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables found:', tables.length);

    for (const t of tables) {
      const tableName = t.table_name;
      const [cols] = await sequelize.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${tableName}'`);
      console.log(`Columns in ${tableName}:`, cols.map(c => c.column_name));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking DB:', error);
    process.exit(1);
  }
};

checkDb();
