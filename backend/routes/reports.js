const express = require('express'); 
const router = express.Router(); 
const reporteController = require('../controllers/reporteController'); 
const { verifyToken, requireRole } = require('../middleware/auth'); 

router.use(verifyToken); 
router.use(requireRole('administrador', 'gerente_ventas', 'gerente_inventario')); 

// Reportes operacionales
router.get('/ordenes', reporteController.reporteOrdenes); 
router.get('/inventario', reporteController.reporteInventario); 
router.get('/clientes', reporteController.reporteClientes); 
router.get('/movimientos', reporteController.reporteMovimientos);
router.get('/stock_bajo', reporteController.reporteStockBajo);
router.get('/pagos', reporteController.reportePagos);
router.get('/devoluciones', reporteController.reporteDevoluciones);

// Reportes de gestión / BI
router.get('/rentabilidad', reporteController.reporteRentabilidad);
router.get('/ventas_cat', reporteController.reporteVentasCategoria);
router.get('/carritos', reporteController.reporteCarritos);
router.get('/clientes_seg', reporteController.reporteClientesSeg);
router.get('/rotacion', reporteController.reporteRotacion);
router.get('/finanzas', reporteController.reporteFinanzas);

module.exports = router; 
