/**
 * Fix Bug #1: Corregir credenciales del admin
 * Cambia email a admin@example.com y contraseña a Admin123!
 * También crea un usuario cliente de prueba
 */
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: 'localhost', port: 5432,
  user: 'postgres', password: 'admin123',
  database: 'product_management'
});

async function fixCredentials() {
  try {
    const adminHash = await bcrypt.hash('Admin123!', 10);
    const clienteHash = await bcrypt.hash('Cliente123!', 10);

    // Actualizar admin
    await pool.query(
      `UPDATE seg_usuarios SET email=$1, password_hash=$2, nombre=$3, apellido=$4 WHERE rol_id=2`,
      ['admin@example.com', adminHash, 'Admin', 'Sistema']
    );
    console.log('✅ Admin actualizado → admin@example.com / Admin123!');

    // Verificar si existe el cliente de prueba
    const existing = await pool.query(`SELECT id FROM seg_usuarios WHERE email='cliente@example.com'`);
    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO seg_usuarios (email, password_hash, nombre, apellido, rol_id, activo) VALUES ($1, $2, $3, $4, $5, $6)`,
        ['cliente@example.com', clienteHash, 'Juan', 'Pérez', 1, true]
      );
      console.log('✅ Cliente creado → cliente@example.com / Cliente123!');

      // Crear perfil de cliente asociado
      const newUser = await pool.query(`SELECT id FROM seg_usuarios WHERE email='cliente@example.com'`);
      await pool.query(
        `INSERT INTO cli_clientes (usuario_id, nombre, apellido, email, activo) VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [newUser.rows[0].id, 'Juan', 'Pérez', 'cliente@example.com', true]
      ).catch(() => console.log('  (perfil cliente ya existía)'));
    } else {
      // Actualizar contraseña del cliente existente
      await pool.query(
        `UPDATE seg_usuarios SET password_hash=$1 WHERE email='cliente@example.com'`,
        [clienteHash]
      );
      console.log('✅ Cliente actualizado → cliente@example.com / Cliente123!');
    }

    // Seed de imágenes para productos (Bug #5)
    console.log('\n📷 Agregando imágenes a productos...');
    const imagenes = [
      { producto_id: 1, url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80', nombre: 'MacBook Pro M2' },
      { producto_id: 2, url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80', nombre: 'iPhone 15 Pro' },
      { producto_id: 3, url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', nombre: 'Zapatillas Running' },
      { producto_id: 4, url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', nombre: 'Sofá Minimalista' },
      { producto_id: 5, url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80', nombre: 'Monitor 4K' },
      { producto_id: 6, url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80', nombre: 'Audifonos' },
      { producto_id: 7, url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80', nombre: 'Zapatillas Casual' },
      { producto_id: 8, url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80', nombre: 'Camiseta' },
      { producto_id: 9, url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80', nombre: 'Smartwatch' },
      { producto_id: 10, url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=600&q=80', nombre: 'Perfume' },
      { producto_id: 11, url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=600&q=80', nombre: 'Tenis Deportivos' },
      { producto_id: 12, url: 'https://images.unsplash.com/photo-1593640408182-31c228c9a61a?auto=format&fit=crop&w=600&q=80', nombre: 'Teclado Mecánico' },
      { producto_id: 13, url: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=80', nombre: 'Silla Gaming' },
      { producto_id: 14, url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80', nombre: 'Laptop Stand' },
      { producto_id: 15, url: 'https://images.unsplash.com/photo-1600085669082-cd28ff0b6e1d?auto=format&fit=crop&w=600&q=80', nombre: 'Mochila' },
    ];

    // Limpiar imágenes existentes y reinsertar
    await pool.query(`DELETE FROM cat_imagenes_producto`);
    for (const img of imagenes) {
      await pool.query(
        `INSERT INTO cat_imagenes_producto (producto_id, url, orden, principal) VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [img.producto_id, img.url, 0, true]
      ).catch(e => console.log(`  Saltando producto_id ${img.producto_id}: ${e.message}`));
    }
    console.log(`✅ ${imagenes.length} imágenes insertadas`);

    // Verificar
    const count = await pool.query(`SELECT COUNT(*) FROM cat_imagenes_producto`);
    console.log(`  Total en BD: ${count.rows[0].count} imágenes`);

    console.log('\n🎉 Correcciones de BD completadas exitosamente!');
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await pool.end();
  }
}

fixCredentials();
