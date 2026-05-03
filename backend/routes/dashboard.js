const express = require('express'); 
const router = express.Router(); 
const dashboardController = require('../controllers/dashboardController'); 
const { verifyToken, requireRole } = require('../middleware/auth'); 

router.use(verifyToken); 
router.use(requireRole('administrador', 'gerente_ventas', 'gerente_inventario')); 
router.get('/kpis', dashboardController.kpis); 
router.get('/ventas-diarias', dashboardController.ventasDiarias); 
router.get('/ventas-categoria', dashboardController.ventasPorCategoria); 
router.get('/ordenes-estado', dashboardController.ordenesPorEstado); 
router.get('/top-productos', dashboardController.topProductos); 
router.get('/embudo', dashboardController.embudo); 

module.exports = router; 
