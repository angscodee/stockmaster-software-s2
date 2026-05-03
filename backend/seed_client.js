
const { Cliente, Usuario, Role, sequelize } = require('./models');
const bcrypt = require('bcryptjs');

async function seedClient() {
  try {
    const password_hash = await bcrypt.hash('Cliente123!', 10);
    
    // Create security user first
    const user = await Usuario.create({
      email: 'juan@example.com',
      password_hash: password_hash,
      nombre: 'Juan',
      apellido: 'Perez',
      rol_id: 1, // cliente
      activo: true
    });

    const client = await Cliente.create({
      usuario_id: user.id,
      telefono: '999888777',
      puntos_acumulados: 100,
      nivel: 'oro',
      activo: true
    });
    console.log('✅ Cliente creado:', client.id);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedClient();
