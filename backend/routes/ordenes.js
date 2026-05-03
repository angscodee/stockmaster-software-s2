const express = require('express'); 
const router = express.Router(); 
const ordenController = require('../controllers/ordenController'); 
const { verifyToken, requireRole } = require('../middleware/auth'); 

router.use(verifyToken); 
router.post('/', ordenController.crear); 
router.get('/mis-ordenes', ordenController.misOrdenes); 
router.get('/', ordenController.listar); 
router.get('/:id/ticket', ordenController.generarTicket);
router.get('/:id', ordenController.obtener); 
router.patch('/:id/estado', requireRole('administrador', 'gerente_ventas', 'vendedor'), ordenController.cambiarEstado); 

module.exports = router; 
