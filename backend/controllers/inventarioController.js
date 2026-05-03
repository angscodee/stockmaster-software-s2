const { Producto, StockProducto, MovimientoInventario, Proveedor, 
        OrdenCompra, Categoria, Marca } = require('../models'); 
const { sequelize } = require('../models'); 
const { Op } = require('sequelize'); 

const inventarioController = { 
  async listarStock(req, res) { 
    try { 
      const { page = 1, limit = 20, bajo_stock } = req.query; 
      const where = { activo: true }; 
      
      const productos = await Producto.findAndCountAll({ 
        where, 
        include: [ 
          { model: StockProducto, as: 'stock' }, 
          { model: Categoria, as: 'categoria', attributes: ['nombre'] }, 
          { model: Marca, as: 'marca', attributes: ['nombre'] } 
        ], 
        limit: parseInt(limit), 
        offset: (page - 1) * limit, 
        order: [['nombre', 'ASC']] 
      }); 

      let data = productos.rows; 
      if (bajo_stock === 'true') { 
        data = data.filter(p => p.stock && 
          (p.stock.stock_fisico - p.stock.stock_reservado) <= p.stock_minimo); 
      } 

      res.json({ success: true, data, total: productos.count }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async ajustarStock(req, res) { 
    const t = await sequelize.transaction(); 
    try { 
      const { producto_id, cantidad, tipo, motivo } = req.body; 
      const stock = await StockProducto.findOne({ where: { producto_id } }); 
      if (!stock) return res.status(404).json({ success: false, message: 'Producto sin registro de stock' }); 

      if (tipo === 'entrada') { 
        await stock.increment('stock_fisico', { by: cantidad, transaction: t }); 
      } else if (tipo === 'salida') { 
        if (stock.stock_fisico < cantidad) 
          return res.status(400).json({ success: false, message: 'Stock insuficiente' }); 
        await stock.decrement('stock_fisico', { by: cantidad, transaction: t }); 
      } else if (tipo === 'ajuste') { 
        await stock.update({ stock_fisico: cantidad }, { transaction: t }); 
      } 

      await MovimientoInventario.create({ 
        producto_id, tipo, cantidad, motivo, 
        usuario_id: req.user.id 
      }, { transaction: t }); 

      await t.commit(); 
      res.json({ success: true, message: 'Stock actualizado' }); 
    } catch (error) { 
      await t.rollback(); 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async movimientos(req, res) { 
    try { 
      const { producto_id, tipo, page = 1, limit = 20 } = req.query; 
      const where = {}; 
      if (producto_id) where.producto_id = producto_id; 
      if (tipo) where.tipo = tipo; 

      const { count, rows } = await MovimientoInventario.findAndCountAll({ 
        where, limit: parseInt(limit), offset: (page - 1) * limit, 
        include: [{ model: Producto, as: 'producto', attributes: ['nombre', 'sku'] }], 
        order: [['created_at', 'DESC']] 
      }); 
      res.json({ success: true, data: rows, total: count }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async listarProveedores(req, res) { 
    try { 
      const proveedores = await Proveedor.findAll({ where: { activo: true } }); 
      res.json({ success: true, data: proveedores }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async crearProveedor(req, res) { 
    try { 
      const proveedor = await Proveedor.create(req.body); 
      res.status(201).json({ success: true, data: proveedor }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async listarOrdenesCompra(req, res) { 
    try { 
      const ordenes = await OrdenCompra.findAll({ 
        include: [{ model: Proveedor, as: 'proveedor' }], 
        order: [['created_at', 'DESC']] 
      }); 
      res.json({ success: true, data: ordenes }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async crearOrdenCompra(req, res) { 
    try { 
      const orden = await OrdenCompra.create({ 
        ...req.body, 
        created_by: req.user.id 
      }); 
      res.status(201).json({ success: true, data: orden }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  } 
}; 

module.exports = inventarioController; 
