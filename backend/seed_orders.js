
const { Orden, ItemOrden, Producto, Cliente, EstadoOrden, sequelize } = require('./models');

async function seedOrders() {
  const t = await sequelize.transaction();
  try {
    // Check if we have clients and products
    const cliente = await Cliente.findOne();
    const productos = await Producto.findAll({ limit: 5 });

    if (!cliente || productos.length === 0) {
      console.log('No hay clientes o productos para crear órdenes.');
      return;
    }

    console.log('Creando órdenes de prueba...');

    for (let i = 1; i <= 5; i++) {
      const subtotal = productos[0].precio_venta * i;
      const total = subtotal * 1.18;

      const orden = await Orden.create({
        codigo: 'ORD-' + i + '-' + Math.floor(Date.now()/1000),
        cliente_id: cliente.id,
        estado_id: 1, // Pendiente
        subtotal: subtotal,
        total: total,
        fecha_orden: new Date()
      }, { transaction: t });

      await ItemOrden.create({
        orden_id: orden.id,
        producto_id: productos[0].id,
        cantidad: i,
        precio_unitario: productos[0].precio_venta
      }, { transaction: t });
    }

    await t.commit();
    console.log('✅ Órdenes de prueba creadas.');
    process.exit(0);
  } catch (error) {
    await t.rollback();
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedOrders();
