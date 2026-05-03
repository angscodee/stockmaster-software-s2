const express = require('express'); 
const router = express.Router(); 
const clienteController = require('../controllers/clienteController'); 
const { verifyToken, requireRole } = require('../middleware/auth'); 

router.use(verifyToken); 
router.get('/', requireRole('administrador', 'gerente_ventas', 'vendedor'), clienteController.listar); 
router.get('/:id', requireRole('administrador', 'gerente_ventas', 'vendedor'), clienteController.obtener); 
router.put('/:id', requireRole('administrador'), clienteController.actualizar); 
router.post('/:id/direcciones', clienteController.agregarDireccion); 

module.exports = router; 
