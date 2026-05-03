
const { Orden, Cliente, sequelize } = require('./models');
const { Op } = require('sequelize');

async function testKPIs() {
  try {
    console.log('Testing Dashboard KPIs...');
    const [totalClientes, totalOrdenes] = await Promise.all([
      Cliente.count(),
      Orden.count()
    ]);
    console.log(`Total Clientes: ${totalClientes}`);
    console.log(`Total Ordenes: ${totalOrdenes}`);

    const [productosBajoStock] = await sequelize.query(` 
      SELECT COUNT(*) as total FROM cat_productos p 
      JOIN inv_stock_producto s ON p.id = s.producto_id 
      WHERE (s.stock_fisico - s.stock_reservado) <= p.stock_minimo 
      AND p.activo = true 
    `, { type: sequelize.QueryTypes.SELECT });
    console.log(`Productos bajo stock: ${productosBajoStock.total}`);

  } catch (error) {
    console.error('Error testing KPIs:', error.message);
  } finally {
    process.exit();
  }
}

testKPIs();
