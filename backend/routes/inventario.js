const express = require('express'); 
const router = express.Router(); 
const inventarioController = require('../controllers/inventarioController'); 
const { verifyToken, requireRole } = require('../middleware/auth'); 

router.use(verifyToken); 
router.get('/stock', inventarioController.listarStock); 
router.post('/ajuste', requireRole('administrador', 'gerente_inventario'), inventarioController.ajustarStock); 
router.get('/movimientos', inventarioController.movimientos); 
router.get('/proveedores', inventarioController.listarProveedores); 
router.post('/proveedores', requireRole('administrador', 'gerente_inventario'), inventarioController.crearProveedor); 
router.get('/ordenes-compra', inventarioController.listarOrdenesCompra); 
router.post('/ordenes-compra', requireRole('administrador', 'gerente_inventario'), inventarioController.crearOrdenCompra); 

module.exports = router; 
