const { generatePdf } = require('../utils/pdfGenerator');
const { Producto, Categoria, StockProducto } = require('../models');

const reportService = {
  async generateInventoryReport(category) {
    const where = {};
    if (category && category !== 'all') {
      if (isNaN(category)) {
        const cat = await Categoria.findOne({ where: { nombre: category } });
        if (cat) where.categoria_id = cat.id;
      } else {
        where.categoria_id = category;
      }
    }

    const products = await Producto.findAll({ 
      where,
      include: [
        { model: Categoria, as: 'categoria', attributes: ['nombre'] },
        { model: StockProducto, as: 'stock', attributes: ['stock_fisico'] }
      ]
    });

    const data = {
      title: 'Listado del Inventario Actual',
      date: new Date().toLocaleDateString(),
      category: category || 'Todas',
      products: products.map(p => ({
        sku: p.sku,
        nombre: p.nombre,
        stock_actual: p.stock?.stock_fisico || 0,
        valor_total: ((p.stock?.stock_fisico || 0) * p.precio_venta).toFixed(2)
      }))
    };

    const template = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            h1 { color: #1e3a8a; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>{{title}}</h1>
            <p>Fecha: {{date}} | Categoría: {{category}}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Stock Actual</th>
                <th>Valor Total (Venta)</th>
              </tr>
            </thead>
            <tbody>
              {{#each products}}
                <tr>
                  <td>{{sku}}</td>
                  <td>{{nombre}}</td>
                  <td>{{stock_actual}}</td>
                  <td>\${{valor_total}}</td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        </body>
      </html>
    `;

    return await generatePdf(template, data);
  },

  async generateManagementReport() {
    const products = await Producto.findAll({
      include: [
        { model: Categoria, as: 'categoria' },
        { model: StockProducto, as: 'stock' }
      ]
    });
    
    // KPIs
    const totalProducts = products.length;
    const totalInventoryValue = products.reduce((sum, p) => 
      sum + ((p.stock?.stock_fisico || 0) * parseFloat(p.precio_costo)), 0);
    const lowStockProducts = products.filter(p => (p.stock?.stock_fisico || 0) < p.stock_minimo).length;

    const data = {
      title: 'Análisis de Inventario y Bajo Stock',
      date: new Date().toLocaleDateString(),
      kpis: {
        totalProducts,
        totalInventoryValue: totalInventoryValue.toFixed(2),
        lowStockProducts
      },
      reorderProducts: products
        .filter(p => (p.stock?.stock_fisico || 0) < p.stock_minimo)
        .map(p => ({
          sku: p.sku,
          nombre: p.nombre,
          stock_actual: p.stock?.stock_fisico || 0,
          stock_minimo: p.stock_minimo,
          proveedor: 'N/A'
        }))
    };

    const template = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            .kpi-container { display: flex; justify-content: space-around; margin: 20px 0; }
            .kpi-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; width: 30%; background-color: #f8fafc; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            h1 { color: #1e3a8a; }
            h2 { color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 30px; }
            .low-stock { color: #ef4444; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>{{title}}</h1>
            <p>Fecha: {{date}}</p>
          </div>

          <h2>Resumen Ejecutivo</h2>
          <div class="kpi-container">
            <div class="kpi-card">
              <h3>Total Productos</h3>
              <p style="font-size: 24px; font-weight: bold;">{{kpis.totalProducts}}</p>
            </div>
            <div class="kpi-card">
              <h3>Valor Inventario</h3>
              <p style="font-size: 24px; font-weight: bold;">\${{kpis.totalInventoryValue}}</p>
            </div>
            <div class="kpi-card">
              <h3>Bajo Stock</h3>
              <p style="font-size: 24px; font-weight: bold;" class="low-stock">{{kpis.lowStockProducts}}</p>
            </div>
          </div>

          <h2>Productos por Reordenar</h2>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {{#each reorderProducts}}
                <tr>
                  <td>{{sku}}</td>
                  <td>{{nombre}}</td>
                  <td class="low-stock">{{stock_actual}}</td>
                  <td>{{stock_minimo}}</td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        </body>
      </html>
    `;

    return await generatePdf(template, data);
  }
};

module.exports = reportService;

