const { Usuario } = require('./models');
const bcrypt = require('bcryptjs');

const checkPassword = async () => {
  try {
    const user = await Usuario.findOne({ where: { email: 'admin@sistema.com' } });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    const isMatch = await bcrypt.compare('admin123', user.password_hash);
    console.log('Password match for admin123:', isMatch);
    process.exit(0);
  } catch (error) {
    console.error('Error checking password:', error);
    process.exit(1);
  }
};

checkPassword();
