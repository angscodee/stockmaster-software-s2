const { Carrito, ItemCarrito, Producto, StockProducto, ImagenProducto } = require('../models'); 

const carritoController = { 
  async obtener(req, res) { 
    try { 
      const clienteId = req.user.id; 
      let carrito = await Carrito.findOne({ 
        where: { cliente_id: clienteId }, 
        include: [{ 
          model: ItemCarrito, as: 'items', 
          include: [{ model: Producto, as: 'producto', 
            include: [
              { model: StockProducto, as: 'stock' },
              { model: ImagenProducto, as: 'imagenes', order: [['orden', 'ASC']] }
            ]
          }] 
        }] 
      }); 
      if (!carrito) carrito = await Carrito.create({ cliente_id: clienteId });

      // Añadir imagen_principal a cada producto del carrito
      if (carrito.items) {
        carrito = carrito.toJSON();
        carrito.items = carrito.items.map(item => {
          if (item.producto) {
            const imagenes = item.producto.imagenes || [];
            const principal = imagenes.find(i => i.principal) || imagenes[0];
            item.producto.imagen_principal = principal ? principal.url : null;
          }
          return item;
        });
      }

      res.json({ success: true, data: carrito }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async agregar(req, res) { 
    try { 
      const clienteId = req.user.id; 
      const { producto_id, cantidad = 1 } = req.body; 

      const producto = await Producto.findByPk(producto_id, { 
        include: [{ model: StockProducto, as: 'stock' }] 
      }); 
      if (!producto || !producto.activo) 
        return res.status(404).json({ success: false, message: 'Producto no encontrado' }); 
      
      const stockDisponible = producto.stock ? (producto.stock.stock_fisico - producto.stock.stock_reservado) : 0;
      if (stockDisponible < cantidad) 
        return res.status(400).json({ success: false, message: 'Stock insuficiente' }); 

      let carrito = await Carrito.findOne({ where: { cliente_id: clienteId } }); 
      if (!carrito) carrito = await Carrito.create({ cliente_id: clienteId }); 

      const [item, created] = await ItemCarrito.findOrCreate({ 
        where: { carrito_id: carrito.id, producto_id }, 
        defaults: { cantidad, precio_unitario: producto.precio_venta } 
      }); 
      if (!created) await item.update({ cantidad: item.cantidad + cantidad }); 

      res.json({ success: true, message: 'Producto agregado al carrito', data: item }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async actualizar(req, res) { 
    try { 
      const { item_id } = req.params; 
      const { cantidad } = req.body; 
      if (cantidad < 1) return res.status(400).json({ success: false, message: 'Cantidad inválida' }); 
      const item = await ItemCarrito.findByPk(item_id); 
      if (!item) return res.status(404).json({ success: false, message: 'Item no encontrado' }); 
      await item.update({ cantidad }); 
      res.json({ success: true, data: item }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async eliminarItem(req, res) { 
    try { 
      const { item_id } = req.params; 
      await ItemCarrito.destroy({ where: { id: item_id } }); 
      res.json({ success: true, message: 'Item eliminado' }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async vaciar(req, res) { 
    try { 
      const clienteId = req.user.id; 
      const carrito = await Carrito.findOne({ where: { cliente_id: clienteId } }); 
      if (carrito) await ItemCarrito.destroy({ where: { carrito_id: carrito.id } }); 
      res.json({ success: true, message: 'Carrito vaciado' }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  } 
}; 

module.exports = carritoController; 
