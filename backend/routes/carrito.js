const express = require('express'); 
const router = express.Router(); 
const carritoController = require('../controllers/carritoController'); 
const { verifyToken } = require('../middleware/auth'); 

router.use(verifyToken); 
router.get('/', carritoController.obtener); 
router.post('/agregar', carritoController.agregar); 
router.put('/item/:item_id', carritoController.actualizar); 
router.delete('/item/:item_id', carritoController.eliminarItem); 
router.delete('/vaciar', carritoController.vaciar); 

module.exports = router; 
