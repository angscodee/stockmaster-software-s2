
const { sequelize } = require('./config/database');

async function resetSchema() {
  try {
    console.log('Limpiando tablas existentes...');
    // Drop in reverse order of dependencies
    const tables = [
      'auditoria_registro', 'configuracion_sistema', 'tipo_cambio', 'monedas',
      'inv_recepciones', 'inv_detalle_orden_compra', 'inv_ordenes_compra',
      'inv_detalle_ajuste', 'inv_ajustes', 'inv_movimientos_inventario',
      'inv_stock_producto', 'inv_proveedores',
      'ord_transacciones_pago', 'ord_pagos', 'ord_historial_estados',
      'ord_items_orden', 'ord_ordenes', 'ord_items_carrito', 'ord_carritos',
      'ord_metodos_envio', 'ord_estados_orden',
      'cli_historial_navegacion', 'cli_resenas_producto', 'cli_items_lista_deseos',
      'cli_lista_deseos', 'cli_direcciones', 'cli_clientes',
      'cat_producto_etiqueta', 'cat_producto_atributo', 'cat_valores_atributo',
      'cat_atributos', 'cat_imagenes_producto', 'cat_productos',
      'cat_etiquetas', 'cat_unidades_medida', 'cat_marcas', 'cat_categorias',
      'refresh_tokens', 'seg_usuario_rol', 'seg_usuarios', 'seg_rol_permiso',
      'seg_permisos', 'seg_roles'
    ];

    for (const table of tables) {
      await sequelize.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }
    
    console.log('✅ Tablas eliminadas.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetSchema();
