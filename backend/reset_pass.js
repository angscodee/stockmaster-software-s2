const { Usuario } = require('./models');
const bcrypt = require('bcryptjs');

const resetPassword = async () => {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const [updated] = await Usuario.update(
      { password_hash: passwordHash },
      { where: { email: 'admin@sistema.com' } }
    );
    if (updated) {
      console.log('Password reset to admin123 for admin@sistema.com');
    } else {
      console.log('User admin@sistema.com not found');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

resetPassword();
