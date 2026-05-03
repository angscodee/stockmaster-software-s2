
const { Usuario } = require('./models');
const bcrypt = require('bcryptjs');

async function testLogin() {
  const email = 'admin@example.com';
  const password = 'Admin123!';
  
  try {
    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }
    
    console.log('Hash en DB:', user.password_hash);
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (isMatch) {
      console.log('✅ Login exitoso');
    } else {
      console.log('❌ Contraseña incorrecta');
      
      // Generar un nuevo hash para estar seguros
      const newHash = await bcrypt.hash(password, 10);
      console.log('Sugerencia de nuevo hash:', newHash);
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testLogin();
