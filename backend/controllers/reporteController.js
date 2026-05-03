const PDFDocument = require('pdfkit');
const {
  Orden, ItemOrden, Producto, Cliente, EstadoOrden, Usuario,
  StockProducto, Categoria, Marca, MovimientoInventario
} = require('../models');
const { Op } = require('sequelize');

// ─── Layout constants ────────────────────────────────────────────────────────
const PAGE_W = 595.28;   // A4 width in points
const MARGIN  = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;  // 495.28
const ROW_H   = 22;
const HEAD_H  = 24;
const BRAND_COLOR  = '#1e40af';
const ALT_ROW_COLOR = '#f8fafc';
const HEADER_TEXT   = '#ffffff';
const BODY_TEXT     = '#1f2937';
const MUTED_TEXT    = '#6b7280';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initPDF(res, filename) {
  const doc = new PDFDocument({ margin: MARGIN, size: 'A4', autoFirstPage: true });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);
  return doc;
}

function drawPageHeader(doc, titulo, subtitulo) {
  // Brand bar
  doc.rect(0, 0, PAGE_W, 8).fill(BRAND_COLOR);

  // Logo / brand name
  doc.fontSize(18).fillColor(BRAND_COLOR).font('Helvetica-Bold')
     .text('StockMaster', MARGIN, 24);

  // Title
  doc.fontSize(13).fillColor(BODY_TEXT).font('Helvetica-Bold')
     .text(titulo, MARGIN, 48);

  if (subtitulo) {
    doc.fontSize(9).fillColor(MUTED_TEXT).font('Helvetica')
       .text(subtitulo, MARGIN, 65);
  }

  // Date
  const dateStr = new Date().toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' });
  doc.fontSize(8).fillColor(MUTED_TEXT).font('Helvetica')
     .text(`Generado: ${dateStr}`, MARGIN, subtitulo ? 65 : 65, { align: 'right', width: CONTENT_W });

  // Divider
  const divY = subtitulo ? 82 : 78;
  doc.moveTo(MARGIN, divY).lineTo(PAGE_W - MARGIN, divY)
     .strokeColor('#e2e8f0').lineWidth(1).stroke();

  doc.y = divY + 12;
}

function drawSummaryBox(doc, items) {
  // items: [{label, value, color?}]
  const boxW = CONTENT_W / items.length;
  const boxH = 48;
  const startY = doc.y;

  items.forEach((item, i) => {
    const x = MARGIN + i * boxW;
    doc.rect(x, startY, boxW - 6, boxH).fill('#f1f5f9').stroke('#e2e8f0');
    doc.fontSize(8).fillColor(MUTED_TEXT).font('Helvetica')
       .text(item.label.toUpperCase(), x + 10, startY + 8, { width: boxW - 20 });
    doc.fontSize(14).fillColor(item.color || BRAND_COLOR).font('Helvetica-Bold')
       .text(item.value, x + 10, startY + 22, { width: boxW - 20 });
  });

  doc.y = startY + boxH + 14;
}

function drawTableHeader(doc, cols) {
  // cols: [{label, x, width, align?}]
  const y = doc.y;
  doc.rect(MARGIN, y, CONTENT_W, HEAD_H).fill(BRAND_COLOR);
  cols.forEach(col => {
    doc.fontSize(8).fillColor(HEADER_TEXT).font('Helvetica-Bold')
       .text(col.label, col.x + 4, y + 7, { width: col.width - 8, align: col.align || 'left', ellipsis: true });
  });
  doc.y = y + HEAD_H;
}

function drawTableRow(doc, cols, values, rowIndex, highlight) {
  const y = doc.y;
  if (y > 760) {
    doc.addPage();
    doc.y = MARGIN + 10;
  }
  const rowY = doc.y;

  // Background
  const bg = highlight ? highlight : (rowIndex % 2 === 0 ? ALT_ROW_COLOR : '#ffffff');
  doc.rect(MARGIN, rowY, CONTENT_W, ROW_H).fill(bg);

  // Left border accent on even rows
  if (rowIndex % 2 === 0) {
    doc.rect(MARGIN, rowY, 3, ROW_H).fill('#cbd5e1');
  }

  cols.forEach((col, i) => {
    const val = values[i] !== undefined && values[i] !== null ? String(values[i]) : '-';
    doc.fontSize(8).fillColor(highlight ? '#7f1d1d' : BODY_TEXT).font('Helvetica')
       .text(val, col.x + 6, rowY + 6, { width: col.width - 12, align: col.align || 'left', ellipsis: true });
  });

  doc.y = rowY + ROW_H;
}

function drawFooter(doc) {
  const pages = doc.bufferedPageRange ? doc.bufferedPageRange() : null;
  doc.fontSize(7).fillColor(MUTED_TEXT).font('Helvetica')
     .text('StockMaster — Documento generado automáticamente. Uso interno.',
       MARGIN, 820, { align: 'center', width: CONTENT_W });
  doc.moveTo(MARGIN, 815).lineTo(PAGE_W - MARGIN, 815)
     .strokeColor('#e2e8f0').lineWidth(0.5).stroke();
}

// ─── Controllers ─────────────────────────────────────────────────────────────

const reporteController = {

  async reporteOrdenes(req, res) {
    try {
      const { desde, hasta } = req.query;
      const where = { estado_id: { [Op.notIn]: [6, 7] } };
      if (desde && hasta) where.fecha_orden = { [Op.between]: [new Date(desde), new Date(hasta)] };

      const ordenes = await Orden.findAll({
        where,
        include: [
          { model: Cliente, as: 'cliente',
            include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido', 'email'] }] },
          { model: EstadoOrden, as: 'estado' },
        ],
        order: [['fecha_orden', 'DESC']],
        limit: 200
      });

      const doc = initPDF(res, 'reporte_ordenes.pdf');
      const total = ordenes.reduce((s, o) => s + parseFloat(o.total), 0);
      const pagadas = ordenes.filter(o => o.estado_id === 2).length;

      drawPageHeader(doc, 'Reporte de Órdenes',
        desde && hasta ? `Período: ${desde} — ${hasta}` : 'Todas las órdenes activas');

      drawSummaryBox(doc, [
        { label: 'Total órdenes', value: ordenes.length },
        { label: 'Pagadas', value: pagadas, color: '#16a34a' },
        { label: 'Monto total', value: `S/. ${total.toFixed(2)}` },
        { label: 'Ticket promedio', value: ordenes.length ? `S/. ${(total / ordenes.length).toFixed(2)}` : 'S/. 0.00' },
      ]);

      const cols = [
        { label: 'Código',   x: MARGIN,       width: 110 },
        { label: 'Cliente',  x: MARGIN + 110,  width: 150 },
        { label: 'Estado',   x: MARGIN + 260,  width: 80  },
        { label: 'Fecha',    x: MARGIN + 340,  width: 85  },
        { label: 'Total',    x: MARGIN + 425,  width: 70, align: 'right' },
      ];

      drawTableHeader(doc, cols);

      ordenes.forEach((o, i) => {
        const nombre = o.cliente?.usuario
          ? `${o.cliente.usuario.nombre || ''} ${o.cliente.usuario.apellido || ''}`.trim()
          : 'Sin nombre';
        drawTableRow(doc, cols, [
          o.codigo,
          nombre,
          o.estado?.nombre || '',
          new Date(o.fecha_orden).toLocaleDateString('es-PE'),
          `S/. ${parseFloat(o.total).toFixed(2)}`,
        ], i);
      });

      drawFooter(doc);
      doc.end();
    } catch (error) {
      console.error('reporteOrdenes error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async reporteInventario(req, res) {
    try {
      const productos = await Producto.findAll({
        where: { activo: true },
        include: [
          { model: StockProducto, as: 'stock' },
          { model: Categoria, as: 'categoria', attributes: ['nombre'] },
          { model: Marca, as: 'marca', attributes: ['nombre'] }
        ],
        order: [['nombre', 'ASC']]
      });

      const doc = initPDF(res, 'reporte_inventario.pdf');
      const valorTotal = productos.reduce((s, p) =>
        s + (parseFloat(p.precio_costo || 0) * (p.stock?.stock_fisico || 0)), 0);
      const criticos = productos.filter(p => {
        const disp = (p.stock?.stock_fisico || 0) - (p.stock?.stock_reservado || 0);
        return disp <= (p.stock_minimo || 0);
      }).length;

      drawPageHeader(doc, 'Reporte de Inventario Valorizado', 'Stock físico, reservado y disponible por producto');

      drawSummaryBox(doc, [
        { label: 'Total productos', value: productos.length },
        { label: 'Stock crítico', value: criticos, color: criticos > 0 ? '#dc2626' : '#16a34a' },
        { label: 'Valor inventario', value: `S/. ${valorTotal.toFixed(2)}` },
      ]);

      const cols = [
        { label: 'SKU',        x: MARGIN,       width: 75  },
        { label: 'Producto',   x: MARGIN + 75,   width: 140 },
        { label: 'Categoría',  x: MARGIN + 215,  width: 80  },
        { label: 'Costo',      x: MARGIN + 295,  width: 55, align: 'right' },
        { label: 'P. Venta',   x: MARGIN + 350,  width: 55, align: 'right' },
        { label: 'Físico',     x: MARGIN + 405,  width: 40, align: 'center' },
        { label: 'Disponible', x: MARGIN + 445,  width: 50, align: 'center' },
      ];

      drawTableHeader(doc, cols);

      productos.forEach((p, i) => {
        const disponible = (p.stock?.stock_fisico || 0) - (p.stock?.stock_reservado || 0);
        const bajo = disponible <= (p.stock_minimo || 0);
        drawTableRow(doc, cols, [
          p.sku || '',
          p.nombre || '',
          p.categoria?.nombre || '',
          `S/. ${parseFloat(p.precio_costo || 0).toFixed(2)}`,
          `S/. ${parseFloat(p.precio_venta || 0).toFixed(2)}`,
          p.stock?.stock_fisico || 0,
          disponible,
        ], i, bajo ? '#fef2f2' : null);
      });

      drawFooter(doc);
      doc.end();
    } catch (error) {
      console.error('reporteInventario error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async reporteClientes(req, res) {
    try {
      const clientes = await Cliente.findAll({
        include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido', 'email'] }],
        order: [['created_at', 'DESC']],
        limit: 200
      });

      const doc = initPDF(res, 'reporte_clientes.pdf');
      const activos = clientes.filter(c => c.activo).length;

      drawPageHeader(doc, 'Reporte de Clientes', 'Listado completo de clientes registrados');

      drawSummaryBox(doc, [
        { label: 'Total clientes', value: clientes.length },
        { label: 'Activos', value: activos, color: '#16a34a' },
        { label: 'Inactivos', value: clientes.length - activos, color: '#dc2626' },
      ]);

      const cols = [
        { label: 'Nombre',      x: MARGIN,       width: 140 },
        { label: 'Email',       x: MARGIN + 140,  width: 160 },
        { label: 'Teléfono',    x: MARGIN + 300,  width: 80  },
        { label: 'Estado',      x: MARGIN + 380,  width: 60  },
        { label: 'Registrado',  x: MARGIN + 440,  width: 55  },
      ];

      drawTableHeader(doc, cols);

      clientes.forEach((c, i) => {
        const nombre = c.usuario
          ? `${c.usuario.nombre || ''} ${c.usuario.apellido || ''}`.trim()
          : 'Sin nombre';
        drawTableRow(doc, cols, [
          nombre,
          c.usuario?.email || '-',
          c.telefono || '-',
          c.activo ? 'Activo' : 'Inactivo',
          new Date(c.created_at).toLocaleDateString('es-PE'),
        ], i);
      });

      drawFooter(doc);
      doc.end();
    } catch (error) {
      console.error('reporteClientes error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async reporteMovimientos(req, res) {
    try {
      const { desde, hasta } = req.query;
      const where = {};
      if (desde && hasta) where.created_at = { [Op.between]: [new Date(desde), new Date(hasta)] };

      const movimientos = await MovimientoInventario.findAll({
        where,
        include: [{ model: Producto, as: 'producto', attributes: ['nombre', 'sku'] }],
        order: [['created_at', 'DESC']],
        limit: 300
      });

      const doc = initPDF(res, 'reporte_movimientos.pdf');
      drawPageHeader(doc, 'Movimientos de Inventario — Kardex', 'Entradas, salidas y ajustes registrados');

      drawSummaryBox(doc, [
        { label: 'Total movimientos', value: movimientos.length },
        { label: 'Entradas', value: movimientos.filter(m => m.tipo_movimiento === 'entrada').length, color: '#16a34a' },
        { label: 'Salidas', value: movimientos.filter(m => m.tipo_movimiento === 'salida').length, color: '#dc2626' },
      ]);

      const cols = [
        { label: 'Fecha',       x: MARGIN,       width: 75  },
        { label: 'Producto',    x: MARGIN + 75,   width: 150 },
        { label: 'Tipo',        x: MARGIN + 225,  width: 70  },
        { label: 'Cantidad',    x: MARGIN + 295,  width: 60, align: 'center' },
        { label: 'Costo Unit.', x: MARGIN + 355,  width: 70, align: 'right'  },
        { label: 'Referencia',  x: MARGIN + 425,  width: 70  },
      ];

      drawTableHeader(doc, cols);

      movimientos.forEach((m, i) => {
        drawTableRow(doc, cols, [
          new Date(m.created_at).toLocaleDateString('es-PE'),
          m.producto?.nombre || `#${m.producto_id}`,
          m.tipo_movimiento || '',
          m.cantidad,
          `S/. ${parseFloat(m.costo_unitario || 0).toFixed(2)}`,
          m.referencia || '-',
        ], i);
      });

      drawFooter(doc);
      doc.end();
    } catch (error) {
      console.error('reporteMovimientos error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async reporteStockBajo(req, res) {
    try {
      const productos = await Producto.findAll({
        where: { activo: true },
        include: [
          { model: StockProducto, as: 'stock' },
          { model: Categoria, as: 'categoria', attributes: ['nombre'] },
        ],
        order: [['nombre', 'ASC']]
      });

      const criticos = productos.filter(p => {
        const disp = (p.stock?.stock_fisico || 0) - (p.stock?.stock_reservado || 0);
        return disp <= (p.stock_minimo || 0);
      });

      const doc = initPDF(res, 'reporte_stock_critico.pdf');
      drawPageHeader(doc, 'Reporte de Stock Crítico', 'Productos agotados o por debajo del mínimo');

      drawSummaryBox(doc, [
        { label: 'Productos críticos', value: criticos.length, color: '#dc2626' },
        { label: 'Agotados', value: criticos.filter(p => (p.stock?.stock_fisico || 0) === 0).length, color: '#7f1d1d' },
        { label: 'Bajo mínimo', value: criticos.filter(p => (p.stock?.stock_fisico || 0) > 0).length, color: '#d97706' },
      ]);

      const cols = [
        { label: 'SKU',         x: MARGIN,       width: 80  },
        { label: 'Producto',    x: MARGIN + 80,   width: 160 },
        { label: 'Categoría',   x: MARGIN + 240,  width: 90  },
        { label: 'Disponible',  x: MARGIN + 330,  width: 65, align: 'center' },
        { label: 'Mínimo',      x: MARGIN + 395,  width: 50, align: 'center' },
        { label: 'Estado',      x: MARGIN + 445,  width: 50  },
      ];

      drawTableHeader(doc, cols);

      criticos.forEach((p, i) => {
        const disponible = (p.stock?.stock_fisico || 0) - (p.stock?.stock_reservado || 0);
        const agotado = disponible <= 0;
        drawTableRow(doc, cols, [
          p.sku || '',
          p.nombre || '',
          p.categoria?.nombre || '',
          disponible,
          p.stock_minimo || 0,
          agotado ? 'AGOTADO' : 'BAJO',
        ], i, agotado ? '#fef2f2' : '#fffbeb');
      });

      drawFooter(doc);
      doc.end();
    } catch (error) {
      console.error('reporteStockBajo error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async reporteRentabilidad(req, res) {
    try {
      const { desde, hasta } = req.query;
      const whereOrden = { estado_id: { [Op.notIn]: [6, 7] } };
      if (desde && hasta) whereOrden.fecha_orden = { [Op.between]: [new Date(desde), new Date(hasta)] };

      const items = await ItemOrden.findAll({
        include: [
          { model: Orden, as: 'orden', where: whereOrden, attributes: ['fecha_orden'] },
          { model: Producto, as: 'producto', attributes: ['nombre', 'sku', 'precio_costo', 'precio_venta'] }
        ]
      });

      const mapa = {};
      items.forEach(item => {
        const pid = item.producto_id;
        if (!mapa[pid]) {
          mapa[pid] = {
            nombre: item.producto?.nombre || `#${pid}`,
            sku: item.producto?.sku || '',
            unidades: 0, ingresos: 0, costos: 0
          };
        }
        mapa[pid].unidades += item.cantidad;
        mapa[pid].ingresos += parseFloat(item.precio_unitario) * item.cantidad;
        mapa[pid].costos += parseFloat(item.producto?.precio_costo || 0) * item.cantidad;
      });

      const productos = Object.values(mapa).sort((a, b) => (b.ingresos - b.costos) - (a.ingresos - a.costos));
      const totalIngresos = productos.reduce((s, p) => s + p.ingresos, 0);
      const totalCostos   = productos.reduce((s, p) => s + p.costos, 0);
      const margenTotal   = totalIngresos - totalCostos;

      const doc = initPDF(res, 'reporte_rentabilidad.pdf');
      drawPageHeader(doc, 'Análisis de Rentabilidad por Producto', 'Costo vs. Venta y margen bruto');

      drawSummaryBox(doc, [
        { label: 'Ingresos totales', value: `S/. ${totalIngresos.toFixed(2)}`, color: '#16a34a' },
        { label: 'Costos totales',   value: `S/. ${totalCostos.toFixed(2)}`,   color: '#dc2626' },
        { label: 'Margen bruto',     value: `S/. ${margenTotal.toFixed(2)}`,   color: BRAND_COLOR },
        { label: 'Margen %', value: totalIngresos > 0 ? `${((margenTotal / totalIngresos) * 100).toFixed(1)}%` : '0%' },
      ]);

      const cols = [
        { label: 'SKU',       x: MARGIN,       width: 75  },
        { label: 'Producto',  x: MARGIN + 75,   width: 145 },
        { label: 'Unidades',  x: MARGIN + 220,  width: 60, align: 'center' },
        { label: 'Ingresos',  x: MARGIN + 280,  width: 75, align: 'right'  },
        { label: 'Costos',    x: MARGIN + 355,  width: 70, align: 'right'  },
        { label: 'Margen',    x: MARGIN + 425,  width: 70, align: 'right'  },
      ];

      drawTableHeader(doc, cols);

      productos.forEach((p, i) => {
        const margen = p.ingresos - p.costos;
        const pct = p.ingresos > 0 ? ((margen / p.ingresos) * 100).toFixed(1) : '0';
        drawTableRow(doc, cols, [
          p.sku,
          p.nombre,
          p.unidades,
          `S/. ${p.ingresos.toFixed(2)}`,
          `S/. ${p.costos.toFixed(2)}`,
          `S/. ${margen.toFixed(2)} (${pct}%)`,
        ], i, margen < 0 ? '#fef2f2' : null);
      });

      drawFooter(doc);
      doc.end();
    } catch (error) {
      console.error('reporteRentabilidad error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async reporteVentasCategoria(req, res) {
    try {
      const { desde, hasta } = req.query;
      const whereOrden = { estado_id: { [Op.notIn]: [6, 7] } };
      if (desde && hasta) whereOrden.fecha_orden = { [Op.between]: [new Date(desde), new Date(hasta)] };

      const items = await ItemOrden.findAll({
        include: [
          { model: Orden, as: 'orden', where: whereOrden, attributes: ['fecha_orden'] },
          { model: Producto, as: 'producto', attributes: ['nombre'],
            include: [{ model: Categoria, as: 'categoria', attributes: ['nombre'] }] }
        ]
      });

      const mapa = {};
      items.forEach(item => {
        const cat = item.producto?.categoria?.nombre || 'Sin categoría';
        if (!mapa[cat]) mapa[cat] = { categoria: cat, unidades: 0, ingresos: 0 };
        mapa[cat].unidades += item.cantidad;
        mapa[cat].ingresos += parseFloat(item.precio_unitario) * item.cantidad;
      });

      const categorias = Object.values(mapa).sort((a, b) => b.ingresos - a.ingresos);
      const totalIngresos = categorias.reduce((s, c) => s + c.ingresos, 0);

      const doc = initPDF(res, 'reporte_ventas_categoria.pdf');
      drawPageHeader(doc, 'Ventas por Categoría', 'Comparativa de ingresos por línea de producto');

      drawSummaryBox(doc, [
        { label: 'Categorías activas', value: categorias.length },
        { label: 'Ingresos totales', value: `S/. ${totalIngresos.toFixed(2)}`, color: BRAND_COLOR },
      ]);

      const cols = [
        { label: 'Categoría',         x: MARGIN,       width: 180 },
        { label: 'Unidades vendidas',  x: MARGIN + 180,  width: 110, align: 'center' },
        { label: 'Ingresos',           x: MARGIN + 290,  width: 110, align: 'right'  },
        { label: '% del total',        x: MARGIN + 400,  width: 95,  align: 'right'  },
      ];

      drawTableHeader(doc, cols);

      categorias.forEach((c, i) => {
        const pct = totalIngresos > 0 ? ((c.ingresos / totalIngresos) * 100).toFixed(1) : '0';
        drawTableRow(doc, cols, [
          c.categoria,
          c.unidades,
          `S/. ${c.ingresos.toFixed(2)}`,
          `${pct}%`,
        ], i);
      });

      drawFooter(doc);
      doc.end();
    } catch (error) {
      console.error('reporteVentasCategoria error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ── Reportes genéricos (próximamente) ──────────────────────────────────────
  _reporteGenerico(titulo, filename, res) {
    const doc = initPDF(res, filename);
    drawPageHeader(doc, titulo, 'Este reporte estará disponible próximamente');
    doc.moveDown(2);
    doc.fontSize(11).fillColor(MUTED_TEXT).font('Helvetica')
       .text('Módulo en desarrollo. Estará disponible en la próxima versión.', { align: 'center', width: CONTENT_W });
    drawFooter(doc);
    doc.end();
  },

  async reporteCarritos(req, res)     { reporteController._reporteGenerico('Comportamiento de Carritos',   'reporte_carritos.pdf',      res); },
  async reporteClientesSeg(req, res)  { reporteController._reporteGenerico('Segmentación de Clientes',     'reporte_segmentacion.pdf',  res); },
  async reporteRotacion(req, res)     { reporteController._reporteGenerico('Rotación de Inventario',       'reporte_rotacion.pdf',      res); },
  async reporteFinanzas(req, res)     { reporteController._reporteGenerico('Ingresos vs Costos',           'reporte_finanzas.pdf',      res); },
  async reportePagos(req, res)        { reporteController._reporteGenerico('Detalle de Pagos',             'reporte_pagos.pdf',         res); },
  async reporteDevoluciones(req, res) { reporteController._reporteGenerico('Listado de Devoluciones',      'reporte_devoluciones.pdf',  res); },
};

module.exports = reporteController;
