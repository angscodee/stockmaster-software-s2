
const dashboardController = require('./controllers/dashboardController');

// Mock req, res
const req = { query: {} };
const res = {
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    console.log(`Status: ${this.statusCode || 200}`);
    console.log('Response:', JSON.stringify(data, null, 2));
  }
};

async function testDashboard() {
  console.log('--- Testing KPIs ---');
  await dashboardController.kpis(req, res);
  
  console.log('\n--- Testing Ventas Diarias ---');
  await dashboardController.ventasDiarias(req, res);
  
  console.log('\n--- Testing Ventas por Categoria ---');
  await dashboardController.ventasPorCategoria(req, res);
  
  console.log('\n--- Testing Ordenes por Estado ---');
  await dashboardController.ordenesPorEstado(req, res);
  
  console.log('\n--- Testing Top Productos ---');
  await dashboardController.topProductos(req, res);
  
  process.exit();
}

testDashboard();
