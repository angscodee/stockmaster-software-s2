require('dotenv').config();
const { Producto, Categoria, Marca, StockProducto, sequelize } = require('./models');

const seedAdvanced = async () => {
  const t = await sequelize.transaction();
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida.');

    // Limpiar datos previos
    await StockProducto.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }, { transaction: t });
    await Producto.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }, { transaction: t });

    // Obtener categorías creadas en el SQL inicial
    const categories = await Categoria.findAll();
    const catMap = {};
    categories.forEach(c => catMap[c.nombre] = c.id);

    // Obtener marcas creadas en el SQL inicial
    const brands = await Marca.findAll();
    const brandMap = {};
    brands.forEach(b => brandMap[b.nombre] = b.id);

    const productsToSeed = [
      { 
        sku: 'ADV-ELE-001', nombre: 'MacBook Pro M2', categoria_id: catMap['Electrónica'], marca_id: brandMap['HP'], 
        precio_costo: 1500.00, precio_venta: 2200.00, stock_minimo: 5, stock_actual: 10 
      },
      { 
        sku: 'ADV-ELE-002', nombre: 'iPhone 15 Pro', categoria_id: catMap['Electrónica'], marca_id: brandMap['Samsung'], 
        precio_costo: 800.00, precio_venta: 1200.00, stock_minimo: 10, stock_actual: 4 
      },
      { 
        sku: 'ADV-ROP-001', nombre: 'Zapatillas Running', categoria_id: catMap['Ropa'], marca_id: brandMap['Nike'],
        precio_costo: 45.00, precio_venta: 110.00, stock_minimo: 15, stock_actual: 25 
      },
      { 
        sku: 'ADV-HOG-001', nombre: 'Sofá Minimalista', categoria_id: catMap['Hogar'], marca_id: brandMap['Generic'],
        precio_costo: 300.00, precio_venta: 550.00, stock_minimo: 3, stock_actual: 2 
      },
      { 
        sku: 'ADV-OFI-001', nombre: 'Monitor 4K 32"', categoria_id: catMap['Oficina'], marca_id: brandMap['Sony'],
        precio_costo: 250.00, precio_venta: 450.00, stock_minimo: 5, stock_actual: 8 
      }
    ];

    for (const pData of productsToSeed) {
      const { stock_actual, ...prodData } = pData;
      const product = await Producto.create(prodData, { transaction: t });
      await StockProducto.create({
        producto_id: product.id,
        stock_fisico: stock_actual,
        stock_reservado: 0
      }, { transaction: t });
    }

    await t.commit();
    console.log('¡Datos avanzados insertados exitosamente!');
    process.exit(0);
  } catch (error) {
    await t.rollback();
    console.error('Error en seeding avanzado:', error);
    process.exit(1);
  }
};

seedAdvanced();

