const { Producto, Categoria, Marca, UnidadMedida, ImagenProducto, StockProducto, sequelize } = require('../models'); 
const { Op } = require('sequelize'); 
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// ── Multer config ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/productos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `prod_${req.params.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes (jpg, png, webp, gif)'));
  }
});

// Helper: extrae imagen_principal de la lista de imágenes
function getImagenPrincipal(producto) {
  const imagenes = producto.imagenes || [];
  const principal = imagenes.find(i => i.principal) || imagenes[0];
  return principal ? principal.url : null;
}

// Helper: serializa producto añadiendo imagen_principal
function serializeProducto(p) {
  const json = p.toJSON ? p.toJSON() : { ...p };
  json.imagen_principal = getImagenPrincipal(json);
  return json;
}

const productController = { 
  async getAll(req, res) { 
    try { 
      const { page = 1, limit = 20, buscar, categoria_id, activo } = req.query; 
      const where = {}; 
      if (buscar) where.nombre = { [Op.iLike]: `%${buscar}%` }; 
      if (categoria_id) where.categoria_id = categoria_id; 
      if (activo !== undefined) where.activo = activo === 'true'; 

      const { count, rows } = await Producto.findAndCountAll({ 
        where, limit: parseInt(limit), offset: (page - 1) * limit, 
        include: [ 
          { model: Categoria, as: 'categoria', attributes: ['nombre'] }, 
          { model: Marca, as: 'marca', attributes: ['nombre'] }, 
          { model: StockProducto, as: 'stock' }, 
          { model: ImagenProducto, as: 'imagenes', order: [['orden', 'ASC']] }
        ], 
        order: [['created_at', 'DESC']] 
      }); 
      res.json({ success: true, data: rows.map(serializeProducto), total: count, page: parseInt(page), limit: parseInt(limit) }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async getById(req, res) { 
    try { 
      const producto = await Producto.findByPk(req.params.id, { 
        include: [ 
          { model: Categoria, as: 'categoria' }, 
          { model: Marca, as: 'marca' }, 
          { model: UnidadMedida, as: 'unidadMedida' }, 
          { model: ImagenProducto, as: 'imagenes', order: [['orden', 'ASC']] }, 
          { model: StockProducto, as: 'stock' } 
        ] 
      }); 
      if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado' }); 
      res.json({ success: true, data: serializeProducto(producto) }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async create(req, res) { 
    const t = await sequelize.transaction();
    try { 
      const data = { ...req.body };
      // Limpiar campos numéricos que vienen como string vacío
      ['precio_costo', 'precio_venta', 'precio_oferta', 'stock_minimo'].forEach(field => {
        if (data[field] === '') data[field] = 0;
        if (data[field] !== undefined) data[field] = parseFloat(data[field]);
      });

      const producto = await Producto.create(data, { transaction: t }); 
      await StockProducto.create({ 
        producto_id: producto.id, 
        stock_fisico: 0, 
        stock_reservado: 0 
      }, { transaction: t }); 
      
      await t.commit();
      res.status(201).json({ success: true, data: producto }); 
    } catch (error) { 
      await t.rollback();
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async update(req, res) { 
    try { 
      const producto = await Producto.findByPk(req.params.id); 
      if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado' }); 
      
      const data = { ...req.body };
      // Limpiar campos numéricos
      ['precio_costo', 'precio_venta', 'precio_oferta', 'stock_minimo'].forEach(field => {
        if (data[field] === '') data[field] = 0;
        if (data[field] !== undefined) data[field] = parseFloat(data[field]);
      });

      await producto.update(data); 
      res.json({ success: true, data: producto }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async delete(req, res) { 
    try { 
      const producto = await Producto.findByPk(req.params.id); 
      if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado' }); 
      await producto.update({ activo: false }); 
      res.json({ success: true, message: 'Producto desactivado' }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async getCategorias(req, res) { 
    try { 
      const categorias = await Categoria.findAll({ where: { activo: true } }); 
      res.json({ success: true, data: categorias }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async getMarcas(req, res) { 
    try { 
      const marcas = await Marca.findAll({ where: { activo: true } }); 
      res.json({ success: true, data: marcas }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  },

  async getUnidades(req, res) { 
    try { 
      const unidades = await UnidadMedida.findAll(); 
      res.json({ success: true, data: unidades }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  },

  async exportarCSV(req, res) {
    try {
      const productos = await Producto.findAll({
        include: [
          { model: Categoria, as: 'categoria', attributes: ['nombre'] },
          { model: Marca, as: 'marca', attributes: ['nombre'] },
          { model: StockProducto, as: 'stock' }
        ]
      });

      let csv = 'SKU,Nombre,Categoria,Marca,Precio Venta,Stock Fisico,Estado\n';
      productos.forEach(p => {
        const sku = p.sku || '';
        const nombre = (p.nombre || '').replace(/,/g, '');
        const categoria = p.categoria ? p.categoria.nombre : '';
        const marca = p.marca ? p.marca.nombre : '';
        const precio = p.precio_venta || 0;
        const stock = p.stock ? p.stock.stock_fisico : 0;
        const estado = p.activo ? 'Activo' : 'Inactivo';
        csv += `${sku},${nombre},${categoria},${marca},${precio},${stock},${estado}\n`;
      });

      res.header('Content-Type', 'text/csv');
      res.attachment('productos.csv');
      return res.send(csv);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Middleware de multer exportado para usar en la ruta
  uploadMiddleware: upload.single('imagen'),

  async subirImagen(req, res) {
    try {
      const { id } = req.params;
      const producto = await Producto.findByPk(id);
      if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

      if (!req.file) return res.status(400).json({ success: false, message: 'No se recibió ningún archivo' });

      // URL pública de la imagen
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const url = `${baseUrl}/uploads/productos/${req.file.filename}`;

      // Si es la primera imagen, marcarla como principal
      const count = await ImagenProducto.count({ where: { producto_id: id } });
      const esPrincipal = count === 0;

      // Si se pide reemplazar la principal, desmarcar las anteriores
      if (req.body.principal === 'true' || esPrincipal) {
        await ImagenProducto.update({ principal: false }, { where: { producto_id: id } });
      }

      const imagen = await ImagenProducto.create({
        producto_id: id,
        url,
        orden: count,
        principal: req.body.principal === 'true' || esPrincipal
      });

      res.status(201).json({ success: true, data: imagen });
    } catch (error) {
      console.error('subirImagen error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async eliminarImagen(req, res) {
    try {
      const { imagenId } = req.params;
      const imagen = await ImagenProducto.findByPk(imagenId);
      if (!imagen) return res.status(404).json({ success: false, message: 'Imagen no encontrada' });

      // Borrar archivo físico si es local
      if (imagen.url.includes('/uploads/')) {
        const filePath = path.join(__dirname, '../', imagen.url.replace(/^https?:\/\/[^/]+/, ''));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await imagen.destroy();

      // Si era la principal, promover la siguiente
      if (imagen.principal) {
        const siguiente = await ImagenProducto.findOne({ where: { producto_id: imagen.producto_id }, order: [['orden', 'ASC']] });
        if (siguiente) await siguiente.update({ principal: true });
      }

      res.json({ success: true, message: 'Imagen eliminada' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}; 

module.exports = productController; 
