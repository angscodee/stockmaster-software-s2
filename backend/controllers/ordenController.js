const models = require('../models/index');

const ordenController = { 
  async crear(req, res) { 
    const t = await models.sequelize.transaction(); 
    try {
      const { items: clientItems, direccion_obj, metodo_envio, metodo_pago, notas } = req.body; 

      let cliente = await models.Cliente.findOne({ where: { usuario_id: req.user.id } });
      if (!cliente) {
        // Crear perfil de cliente si no existe (ej. para Administradores)
        cliente = await models.Cliente.create({
          usuario_id: req.user.id,
          email: req.user.email,
          activo: true
        }, { transaction: t });
      }
      const clienteId = cliente.id;

      if (!clientItems || !clientItems.length) 
        return res.status(400).json({ success: false, message: 'Carrito vacío' }); 

      // 1. Obtener productos para validación
      const productIds = clientItems.map(i => i.producto_id);
      const productos = await models.Producto.findAll({
        where: { id: productIds },
        include: [{ model: models.StockProducto, as: 'stock' }]
      });

      const itemsConfirmados = [];
      let subtotalNeto = 0;

      for (const reqItem of clientItems) {
        const prod = productos.find(p => p.id === reqItem.producto_id);
        if (!prod) return res.status(400).json({ success: false, message: 'Producto no encontrado' });

        if (!prod.stock || prod.stock.stock_fisico - prod.stock.stock_reservado < reqItem.cantidad) {
          return res.status(400).json({ success: false, message: `Stock insuficiente: ${prod.nombre}` });
        }

        const precio = parseFloat(prod.precio_venta);
        itemsConfirmados.push({
          producto_id: prod.id,
          cantidad: reqItem.cantidad,
          precio_unitario: precio,
          subtotal: precio * reqItem.cantidad
        });
        subtotalNeto += (precio * reqItem.cantidad) / 1.18; // Desglosar IGV internamente
      }

      const total = itemsConfirmados.reduce((sum, i) => sum + i.subtotal, 0);
      const impuestos = total - subtotalNeto;

      // 2. Crear Dirección
      let direccion_envio_id = null;
      if (direccion_obj) {
        const dir = await models.Direccion.create({
          cliente_id: clienteId,
          direccion_linea1: direccion_obj.direccion_linea1 || 'No especificada',
          ciudad: direccion_obj.ciudad || 'No especificada',
          departamento: direccion_obj.departamento || '',
          codigo_postal: direccion_obj.codigo_postal || ''
        }, { transaction: t });
        direccion_envio_id = dir.id;
      }

      // 3. Crear Orden
      const codigo = 'ORD-' + Date.now(); 
      const orden = await models.Orden.create({ 
        codigo, cliente_id: clienteId, estado_id: 1, 
        subtotal: subtotalNeto, impuestos, total, 
        direccion_envio_id, metodo_pago, notas 
      }, { transaction: t }); 

      // 4. Crear Items de Orden
      const itemsData = itemsConfirmados.map(i => ({ 
        orden_id: orden.id, 
        producto_id: i.producto_id, 
        cantidad: i.cantidad, 
        precio_unitario: i.precio_unitario
      })); 
      await models.ItemOrden.bulkCreate(itemsData, { 
        transaction: t,
        fields: ['orden_id', 'producto_id', 'cantidad', 'precio_unitario'] 
      }); 

      // 5. Reservar Stock
      for (const item of itemsConfirmados) { 
        await models.StockProducto.increment('stock_reservado', { 
          by: item.cantidad, 
          where: { producto_id: item.producto_id }, 
          transaction: t 
        }); 
      } 

      // 6. Historial de Estado
      await models.HistorialEstado.create({ 
        orden_id: orden.id, estado_id: 1, 
        usuario_id: req.user.id, comentario: 'Orden creada' 
      }, { transaction: t }); 

      await t.commit(); 
      res.status(201).json({ success: true, data: orden }); 
    } catch (error) { 
      await t.rollback(); 
      console.error("CREATE ORDEN ERROR:", error);
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  // GET /ordenes/mis-ordenes — siempre filtra por el usuario autenticado
  async misOrdenes(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const estado_id = req.query.estado_id;

      // Buscar o crear perfil de cliente para el usuario autenticado
      let cliente = await models.Cliente.findOne({ where: { usuario_id: req.user.id } });
      if (!cliente) {
        return res.json({ success: true, data: [], total: 0, page, limit });
      }

      const where = { cliente_id: cliente.id };
      if (estado_id) where.estado_id = estado_id;

      const { count, rows } = await models.Orden.findAndCountAll({
        where,
        limit,
        offset: (page - 1) * limit,
        include: [
          { model: models.EstadoOrden, as: 'estado' },
          {
            model: models.Cliente, as: 'cliente',
            include: [{ model: models.Usuario, as: 'usuario', attributes: ['nombre', 'apellido', 'email'] }]
          },
          { model: models.MetodoEnvio, as: 'metodoEnvio' }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({ success: true, data: rows, total: count, page, limit });
    } catch (error) {
      console.error("MIS ORDENES ERROR:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /ordenes — solo para admin/staff, devuelve todas las órdenes
  async listar(req, res) { 
    try { 
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const estado_id = req.query.estado_id;
      
      const where = {};
      if (estado_id) where.estado_id = estado_id; 

      const { count, rows } = await models.Orden.findAndCountAll({ 
        where, 
        limit, 
        offset: (page - 1) * limit, 
        include: [ 
          { model: models.EstadoOrden, as: 'estado' }, 
          { 
            model: models.Cliente, as: 'cliente', 
            include: [{ model: models.Usuario, as: 'usuario', attributes: ['nombre', 'apellido', 'email'] }] 
          }, 
          { model: models.MetodoEnvio, as: 'metodoEnvio' } 
        ], 
        order: [['created_at', 'DESC']] 
      }); 
      
      res.json({ 
        success: true, 
        data: rows, 
        total: count, 
        page, 
        limit 
      }); 
    } catch (error) { 
      console.error("LISTAR ORDENES ERROR:", error);
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async obtener(req, res) { 
    try { 
      const orden = await models.Orden.findByPk(req.params.id, { 
        include: [ 
          { model: models.EstadoOrden, as: 'estado' }, 
          { 
            model: models.Cliente, as: 'cliente', 
            include: [{ model: models.Usuario, as: 'usuario', attributes: ['nombre', 'apellido', 'email'] }] 
          }, 
          { model: models.ItemOrden, as: 'items', 
            include: [{ model: models.Producto, as: 'producto', attributes: ['nombre', 'sku'] }] }, 
          { model: models.HistorialEstado, as: 'historial', 
            include: [{ model: models.EstadoOrden, as: 'estado' }] }, 
          { model: models.Pago, as: 'pagos' } 
        ] 
      }); 
      if (!orden) return res.status(404).json({ success: false, message: 'Orden no encontrada' }); 
      res.json({ success: true, data: orden }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  },

  async generarTicket(req, res) {
    try {
      const orden = await models.Orden.findByPk(req.params.id, {
        include: [
          { model: models.EstadoOrden, as: 'estado' },
          {
            model: models.Cliente, as: 'cliente',
            include: [{ model: models.Usuario, as: 'usuario', attributes: ['nombre', 'apellido', 'email'] }]
          },
          {
            model: models.ItemOrden, as: 'items',
            include: [{ model: models.Producto, as: 'producto', attributes: ['nombre', 'sku'] }]
          }
        ]
      });

      if (!orden) return res.status(404).json({ success: false, message: 'Orden no encontrada' });

      const PDFDocument = require('pdfkit');

      // Ticket 80mm de ancho = 226.77pt
      const TICKET_W = 226.77;
      const MARGIN   = 12;
      const COL_W    = TICKET_W - MARGIN * 2;

      const doc = new PDFDocument({ size: [TICKET_W, 800], margin: MARGIN, autoFirstPage: true });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="ticket_${orden.codigo}.pdf"`);
      doc.pipe(res);

      const cliente     = orden.cliente?.usuario;
      const nombreCliente = cliente ? `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() : 'Cliente';
      const items       = orden.items || [];
      const subtotal    = parseFloat(orden.subtotal);
      const impuestos   = parseFloat(orden.impuestos);
      const total       = parseFloat(orden.total);

      let y = MARGIN;

      // Encabezado azul
      doc.rect(0, 0, TICKET_W, 54).fill('#1e40af');
      doc.fontSize(14).fillColor('#ffffff').font('Helvetica-Bold')
         .text('StockMaster', MARGIN, 10, { width: COL_W, align: 'center' });
      doc.fontSize(7).fillColor('#bfdbfe').font('Helvetica')
         .text('COMPROBANTE DE VENTA', MARGIN, 28, { width: COL_W, align: 'center' });
      doc.fontSize(7).fillColor('#bfdbfe')
         .text('RUC: 20123456789', MARGIN, 39, { width: COL_W, align: 'center' });
      y = 62;

      // Código y fecha
      doc.fontSize(8).fillColor('#1e40af').font('Helvetica-Bold')
         .text(orden.codigo, MARGIN, y, { width: COL_W, align: 'center' });
      y += 13;
      doc.fontSize(7).fillColor('#6b7280').font('Helvetica')
         .text(new Date(orden.fecha_orden).toLocaleString('es-PE', {
           day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
         }), MARGIN, y, { width: COL_W, align: 'center' });
      y += 11;

      const dash = (yy) => {
        doc.moveTo(MARGIN, yy).lineTo(TICKET_W - MARGIN, yy)
           .dash(2, { space: 2 }).strokeColor('#d1d5db').lineWidth(0.5).stroke().undash();
      };

      dash(y); y += 9;

      // Cliente
      doc.fontSize(7).fillColor('#374151').font('Helvetica-Bold').text('CLIENTE', MARGIN, y); y += 11;
      doc.fontSize(7).fillColor('#374151').font('Helvetica').text(nombreCliente, MARGIN, y); y += 10;
      if (cliente?.email) { doc.fontSize(6.5).fillColor('#6b7280').text(cliente.email, MARGIN, y); y += 9; }
      if (orden.metodo_pago) {
        doc.fontSize(6.5).fillColor('#6b7280').text(`Pago: ${orden.metodo_pago.toUpperCase()}`, MARGIN, y); y += 9;
      }

      dash(y); y += 9;

      // Cabecera tabla
      doc.fontSize(7).fillColor('#374151').font('Helvetica-Bold');
      doc.text('PRODUCTO',  MARGIN,       y, { width: 100 });
      doc.text('CANT',      MARGIN + 100, y, { width: 28,  align: 'center' });
      doc.text('P.U.',      MARGIN + 128, y, { width: 36,  align: 'right'  });
      doc.text('TOTAL',     MARGIN + 164, y, { width: 38,  align: 'right'  });
      y += 11;
      dash(y); y += 7;

      // Items
      doc.font('Helvetica').fontSize(7).fillColor('#1f2937');
      items.forEach(item => {
        const nombre = (item.producto?.nombre || `#${item.producto_id}`);
        const corto  = nombre.length > 22 ? nombre.substring(0, 22) + '…' : nombre;
        const cant   = item.cantidad;
        const pu     = parseFloat(item.precio_unitario);
        const sub    = pu * cant;
        doc.text(corto,           MARGIN,       y, { width: 100 });
        doc.text(`${cant}`,       MARGIN + 100, y, { width: 28,  align: 'center' });
        doc.text(pu.toFixed(2),   MARGIN + 128, y, { width: 36,  align: 'right'  });
        doc.text(sub.toFixed(2),  MARGIN + 164, y, { width: 38,  align: 'right'  });
        y += 13;
      });

      dash(y); y += 9;

      // Totales
      const rowTotal = (label, valor, bold = false) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica')
           .fontSize(bold ? 8.5 : 7)
           .fillColor(bold ? '#1e40af' : '#374151');
        doc.text(label,                  MARGIN,       y, { width: 120 });
        doc.text(`S/. ${valor.toFixed(2)}`, MARGIN + 120, y, { width: 82, align: 'right' });
        y += bold ? 14 : 11;
      };
      rowTotal('Subtotal (sin IGV)', subtotal);
      rowTotal('IGV (18%)', impuestos);
      dash(y); y += 7;
      rowTotal('TOTAL A PAGAR', total, true);
      y += 7;

      // Badge estado
      const estadoNombre = orden.estado?.nombre || 'Pendiente';
      const badgeColor   = orden.estado_id === 2 ? '#16a34a' : orden.estado_id >= 5 ? '#7c3aed' : '#d97706';
      doc.roundedRect(MARGIN, y, COL_W, 20, 4).fill(badgeColor);
      doc.fontSize(8).fillColor('#ffffff').font('Helvetica-Bold')
         .text(`Estado: ${estadoNombre.toUpperCase()}`, MARGIN, y + 6, { width: COL_W, align: 'center' });
      y += 28;

      // Pie
      dash(y); y += 9;
      doc.fontSize(7).fillColor('#374151').font('Helvetica-Bold')
         .text('¡Gracias por tu compra!', MARGIN, y, { width: COL_W, align: 'center' });
      y += 10;
      doc.fontSize(6.5).fillColor('#9ca3af').font('Helvetica')
         .text('www.stockmaster.pe  |  soporte@stockmaster.pe', MARGIN, y, { width: COL_W, align: 'center' });
      y += 14;

      doc.end();
    } catch (error) {
      console.error('generarTicket error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async cambiarEstado(req, res) { 
    const t = await models.sequelize.transaction(); 
    try { 
      const { id } = req.params; 
      const { estado_id, comentario } = req.body; 

      const orden = await models.Orden.findByPk(id); 
      if (!orden) return res.status(404).json({ success: false, message: 'Orden no encontrada' }); 

      await orden.update({ estado_id }, { transaction: t }); 
      await models.HistorialEstado.create({ 
        orden_id: id, estado_id, 
        usuario_id: req.user.id, comentario 
      }, { transaction: t }); 

      // Si pagada: descontar stock físico y liberar reserva (el pago confirma la venta)
      if (estado_id === 2) {
        const items = await models.ItemOrden.findAll({ where: { orden_id: id } });
        for (const item of items) {
          // Usar GREATEST para respetar constraints >= 0 en ambas columnas
          await models.sequelize.query(
            `UPDATE inv_stock_producto
             SET stock_fisico    = GREATEST(0, stock_fisico    - :cantidad),
                 stock_reservado = GREATEST(0, stock_reservado - :cantidad)
             WHERE producto_id = :producto_id`,
            { replacements: { cantidad: item.cantidad, producto_id: item.producto_id }, transaction: t }
          );
        }
      }

      // Si entregada: solo registrar (stock ya fue descontado al pagar)
      // Si viene de un flujo sin pasar por "Pagada", descontar stock físico y liberar reserva
      if (estado_id === 5) {
        // Solo descontar si no pasó por estado Pagada (estado_id 2)
        const yaPago = await models.HistorialEstado.findOne({
          where: { orden_id: id, estado_id: 2 }
        });
        if (!yaPago) {
          const items = await models.ItemOrden.findAll({ where: { orden_id: id } });
          for (const item of items) {
            await models.sequelize.query(
              `UPDATE inv_stock_producto
               SET stock_fisico    = GREATEST(0, stock_fisico    - :cantidad),
                   stock_reservado = GREATEST(0, stock_reservado - :cantidad)
               WHERE producto_id = :producto_id`,
              { replacements: { cantidad: item.cantidad, producto_id: item.producto_id }, transaction: t }
            );
          }
        }
      }

      // Si cancelada: liberar reserva
      if (estado_id === 6) {
        const items = await models.ItemOrden.findAll({ where: { orden_id: id } });
        for (const item of items) {
          await models.sequelize.query(
            `UPDATE inv_stock_producto
             SET stock_reservado = GREATEST(0, stock_reservado - :cantidad)
             WHERE producto_id = :producto_id`,
            { replacements: { cantidad: item.cantidad, producto_id: item.producto_id }, transaction: t }
          );
        }
      } 

      await t.commit(); 
      res.json({ success: true, message: 'Estado actualizado' }); 
    } catch (error) { 
      await t.rollback(); 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  } 
}; 

module.exports = ordenController; 
