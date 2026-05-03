const { Orden, ItemOrden, Producto, Cliente, StockProducto, 
        Categoria, EstadoOrden } = require('../models'); 
const { sequelize } = require('../models'); 
const { Op } = require('sequelize'); 

const dashboardController = { 
  async kpis(req, res) { 
    try { 
      const hoy = new Date(); 
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1); 
      const mesAnteriorInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1); 
      const mesAnteriorFin = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      const hace30dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [ventasMes, ventasMesAnterior, totalClientes, 
             ordenesPendientes, productosBajoStock,
             clientesNuevos, topCategoriaData, carritos] = await Promise.all([ 
        Orden.sum('total', { where: { 
          estado_id: { [Op.notIn]: [6, 7] }, 
          created_at: { [Op.gte]: inicioMes } 
        }}), 
        Orden.sum('total', { where: { 
          estado_id: { [Op.notIn]: [6, 7] }, 
          created_at: { [Op.between]: [mesAnteriorInicio, mesAnteriorFin] } 
        }}), 
        Cliente.count(), 
        Orden.count({ where: { estado_id: 1 } }), 
        sequelize.query(` 
          SELECT COUNT(*) as total FROM cat_productos p 
          JOIN inv_stock_producto s ON p.id = s.producto_id 
          WHERE (s.stock_fisico - s.stock_reservado) <= p.stock_minimo 
          AND p.activo = true 
        `, { type: sequelize.QueryTypes.SELECT }),
        Cliente.count({ where: { created_at: { [Op.gte]: hace30dias } } }),
        sequelize.query(`
          SELECT c.nombre, COALESCE(SUM(oi.subtotal), 0) as total
          FROM ord_items_orden oi
          JOIN cat_productos p ON oi.producto_id = p.id
          JOIN cat_categorias c ON p.categoria_id = c.id
          JOIN ord_ordenes o ON oi.orden_id = o.id
          WHERE o.estado_id NOT IN (6, 7)
          GROUP BY c.nombre ORDER BY total DESC LIMIT 1
        `, { type: sequelize.QueryTypes.SELECT }),
        sequelize.query(`
          SELECT COUNT(*) as total_carritos,
                 COUNT(CASE WHEN id IN (SELECT DISTINCT carrito_id FROM ord_items_carrito) THEN 1 END) as carritos_con_items
          FROM ord_carritos
        `, { type: sequelize.QueryTypes.SELECT }),
      ]); 

      const cantidadOrdenes = await Orden.count({ where: { 
        estado_id: { [Op.notIn]: [6, 7] }, 
        created_at: { [Op.gte]: inicioMes } 
      }});

      const totalCarritos = parseInt(carritos[0]?.total_carritos || 0);
      const carritosConItems = parseInt(carritos[0]?.carritos_con_items || 0);
      const tasaConversion = totalCarritos > 0 
        ? ((cantidadOrdenes / totalCarritos) * 100).toFixed(1) 
        : 0;
      const tasaAbandono = carritosConItems > 0
        ? (((carritosConItems - cantidadOrdenes) / carritosConItems) * 100).toFixed(1)
        : 0;

      const reembolsosData = await Orden.findAll({
        where: { estado_id: { [Op.in]: [6, 7] }, created_at: { [Op.gte]: inicioMes } },
        attributes: ['total']
      });
      const montoReembolsos = reembolsosData.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

      res.json({ success: true, data: { 
        ventasMes: ventasMes || 0, 
        ventasMesAnterior: ventasMesAnterior || 0, 
        crecimiento: ventasMesAnterior 
          ? (((ventasMes - ventasMesAnterior) / ventasMesAnterior) * 100).toFixed(1) 
          : 0, 
        ticketPromedio: cantidadOrdenes ? ((ventasMes || 0) / cantidadOrdenes).toFixed(2) : 0, 
        totalClientes, 
        ordenesPendientes, 
        productosBajoStock: parseInt(productosBajoStock[0]?.total || 0), 
        cantidadOrdenes,
        tasaConversion,
        tasaAbandono,
        clientesNuevos: clientesNuevos || 0,
        ingresosTopCategoria: parseFloat(topCategoriaData[0]?.total || 0),
        topCategoriaNombre: topCategoriaData[0]?.nombre || 'N/A',
        montoReembolsos: montoReembolsos.toFixed(2),
        cantidadReembolsos: reembolsosData.length,
      }}); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async ventasDiarias(req, res) { 
    try { 
      const dias = parseInt(req.query.dias) || 30; 
      const desde = new Date(); 
      desde.setDate(desde.getDate() - dias); 

      const data = await sequelize.query(` 
        SELECT DATE(fecha_orden) as fecha, 
               COUNT(*) as cantidad, 
               COALESCE(SUM(total), 0) as total,
               COALESCE(SUM(total * 0.72), 0) as costo,
               COALESCE(SUM(total * 0.28), 0) as margen
        FROM ord_ordenes 
        WHERE fecha_orden >= :desde 
        AND estado_id NOT IN (6, 7) 
        GROUP BY DATE(fecha_orden) 
        ORDER BY fecha ASC 
      `, { replacements: { desde }, type: sequelize.QueryTypes.SELECT }); 

      res.json({ success: true, data }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async ventasPorCategoria(req, res) { 
    try { 
      const data = await sequelize.query(` 
        SELECT c.nombre as categoria, 
               COUNT(oi.id) as cantidad, 
               COALESCE(SUM(oi.subtotal), 0) as total 
        FROM ord_items_orden oi 
        JOIN cat_productos p ON oi.producto_id = p.id 
        JOIN cat_categorias c ON p.categoria_id = c.id 
        JOIN ord_ordenes o ON oi.orden_id = o.id 
        WHERE o.estado_id NOT IN (6, 7) 
        GROUP BY c.nombre 
        ORDER BY total DESC 
        LIMIT 6 
      `, { type: sequelize.QueryTypes.SELECT }); 

      res.json({ success: true, data }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async ordenesPorEstado(req, res) { 
    try { 
      const data = await sequelize.query(` 
        SELECT e.nombre as estado, COUNT(o.id) as cantidad 
        FROM ord_ordenes o 
        JOIN ord_estados_orden e ON o.estado_id = e.id 
        GROUP BY e.nombre 
        ORDER BY cantidad DESC 
      `, { type: sequelize.QueryTypes.SELECT }); 

      res.json({ success: true, data }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async topProductos(req, res) { 
    try { 
      const data = await sequelize.query(` 
        SELECT p.nombre, p.sku, 
               SUM(oi.cantidad) as unidades_vendidas, 
               SUM(oi.subtotal) as ingresos 
        FROM ord_items_orden oi 
        JOIN cat_productos p ON oi.producto_id = p.id 
        JOIN ord_ordenes o ON oi.orden_id = o.id 
        WHERE o.estado_id NOT IN (6, 7) 
        GROUP BY p.id, p.nombre, p.sku 
        ORDER BY unidades_vendidas DESC 
        LIMIT 10 
      `, { type: sequelize.QueryTypes.SELECT }); 

      res.json({ success: true, data }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  },

  async embudo(req, res) {
    try {
      const [totalCarritosRes, carritosConItemsRes, totalOrdenesRes, totalPagosRes] = await Promise.all([
        sequelize.query(`SELECT COUNT(*) as total FROM ord_carritos`, { type: sequelize.QueryTypes.SELECT }),
        sequelize.query(`SELECT COUNT(*) as total FROM ord_carritos WHERE id IN (SELECT DISTINCT carrito_id FROM ord_items_carrito)`, { type: sequelize.QueryTypes.SELECT }),
        Orden.count(),
        Orden.count({ where: { estado_id: { [Op.in]: [2, 3, 4, 5] } } }),
      ]);

      const carritosTotal = parseInt(totalCarritosRes[0]?.total || 0);
      const carritosConItems = parseInt(carritosConItemsRes[0]?.total || 0);
      const visitas = Math.max(carritosTotal * 5, 100);

      res.json({
        success: true,
        data: [
          { value: visitas, name: 'Visitas' },
          { value: carritosConItems, name: 'Carrito' },
          { value: parseInt(totalOrdenesRes || 0), name: 'Checkout' },
          { value: parseInt(totalPagosRes || 0), name: 'Pago' },
        ]
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}; 

module.exports = dashboardController; 
