const express = require('express'); 
const router = express.Router(); 
const productController = require('../controllers/productController'); 
const { verifyToken, requireRole } = require('../middleware/auth'); 

router.get('/', productController.getAll); 
router.get('/categorias', productController.getCategorias); 
router.get('/marcas', productController.getMarcas); 
router.get('/unidades', productController.getUnidades); 
router.get('/exportar', productController.exportarCSV); 
router.get('/:id', productController.getById); 
router.post('/', verifyToken, requireRole('administrador', 'gerente_inventario'), productController.create); 
router.put('/:id', verifyToken, requireRole('administrador', 'gerente_inventario'), productController.update); 
router.delete('/:id', verifyToken, requireRole('administrador'), productController.delete); 

// Gestión de imágenes
router.post('/:id/imagen', verifyToken, requireRole('administrador', 'gerente_inventario'), productController.uploadMiddleware, productController.subirImagen);
router.delete('/:id/imagen/:imagenId', verifyToken, requireRole('administrador', 'gerente_inventario'), productController.eliminarImagen);

module.exports = router; 
