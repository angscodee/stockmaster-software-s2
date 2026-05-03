-- ============================================================ 
 -- SISTEMA E-COMMERCE - BASE DE DATOS COMPLETA 
 -- ======================== 
 -- MÓDULO SEGURIDAD 
 CREATE TABLE IF NOT EXISTS seg_roles ( 
     id SERIAL PRIMARY KEY, 
     nombre VARCHAR(30) NOT NULL UNIQUE, 
     descripcion TEXT, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS seg_permisos ( 
     id SERIAL PRIMARY KEY, 
     modulo VARCHAR(50) NOT NULL, 
     accion VARCHAR(20) NOT NULL, 
     descripcion TEXT, 
     UNIQUE(modulo, accion) 
 ); 
  
 CREATE TABLE IF NOT EXISTS seg_rol_permiso ( 
     rol_id INT REFERENCES seg_roles(id) ON DELETE CASCADE, 
     permiso_id INT REFERENCES seg_permisos(id) ON DELETE CASCADE, 
     PRIMARY KEY (rol_id, permiso_id) 
 ); 
  
 CREATE TABLE IF NOT EXISTS seg_usuarios ( 
     id SERIAL PRIMARY KEY, 
     email VARCHAR(100) NOT NULL UNIQUE, 
     password_hash TEXT NOT NULL, 
     nombre VARCHAR(80), 
     apellido VARCHAR(80), 
     telefono VARCHAR(20), 
     rol_id INT NOT NULL REFERENCES seg_roles(id), 
     activo BOOLEAN DEFAULT TRUE, 
     email_verificado BOOLEAN DEFAULT FALSE, 
     reset_token VARCHAR(255), 
     reset_expires TIMESTAMP, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS refresh_tokens ( 
     id SERIAL PRIMARY KEY, 
     token TEXT NOT NULL UNIQUE, 
     usuario_id INT NOT NULL REFERENCES seg_usuarios(id) ON DELETE CASCADE, 
     expires_at TIMESTAMP NOT NULL, 
     revocado BOOLEAN DEFAULT FALSE, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS seg_usuario_rol ( 
     usuario_id INT REFERENCES seg_usuarios(id) ON DELETE CASCADE, 
     rol_id INT REFERENCES seg_roles(id) ON DELETE CASCADE, 
     PRIMARY KEY (usuario_id, rol_id) 
 ); 
  
 -- ======================== 
 -- MÓDULO CATÁLOGO 
 -- ======================== 
  
 CREATE TABLE IF NOT EXISTS cat_categorias ( 
     id SERIAL PRIMARY KEY, 
     nombre VARCHAR(100) NOT NULL UNIQUE, 
     slug VARCHAR(120) NOT NULL UNIQUE, 
     padre_id INT REFERENCES cat_categorias(id) ON DELETE SET NULL, 
     activo BOOLEAN DEFAULT TRUE, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS cat_marcas ( 
     id SERIAL PRIMARY KEY, 
     nombre VARCHAR(80) NOT NULL UNIQUE, 
     activo BOOLEAN DEFAULT TRUE, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS cat_unidades_medida ( 
     id SERIAL PRIMARY KEY, 
     nombre VARCHAR(20) NOT NULL UNIQUE, 
     abreviatura VARCHAR(5) 
 ); 
  
 CREATE TABLE IF NOT EXISTS cat_etiquetas ( 
     id SERIAL PRIMARY KEY, 
     nombre VARCHAR(50) NOT NULL UNIQUE, 
     slug VARCHAR(60) NOT NULL UNIQUE 
 ); 
  
 CREATE TABLE IF NOT EXISTS cat_productos ( 
     id SERIAL PRIMARY KEY, 
     sku VARCHAR(50) NOT NULL UNIQUE, 
     nombre VARCHAR(200) NOT NULL, 
     descripcion_corta VARCHAR(300), 
     descripcion_larga TEXT, 
     categoria_id INT NOT NULL REFERENCES cat_categorias(id), 
     marca_id INT REFERENCES cat_marcas(id), 
     unidad_medida_id INT REFERENCES cat_unidades_medida(id), 
     precio_costo DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (precio_costo >= 0), 
     precio_venta DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (precio_venta >= 0), 
     precio_oferta DECIMAL(12,2) CHECK (precio_oferta >= 0), 
     oferta_inicio DATE, 
     oferta_fin DATE, 
     peso DECIMAL(10,2), 
     dimensiones VARCHAR(100), 
     stock_minimo INT DEFAULT 0 CHECK (stock_minimo >= 0), 
     activo BOOLEAN DEFAULT TRUE, 
     created_by INT REFERENCES seg_usuarios(id), 
     updated_by INT REFERENCES seg_usuarios(id), 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     CONSTRAINT check_precio_oferta CHECK ( 
         (precio_oferta IS NULL) OR (precio_oferta < precio_venta) 
     ) 
 ); 
  
 CREATE TABLE IF NOT EXISTS cat_imagenes_producto ( 
     id SERIAL PRIMARY KEY, 
     producto_id INT NOT NULL REFERENCES cat_productos(id) ON DELETE CASCADE, 
     url VARCHAR(500) NOT NULL, 
     orden INT DEFAULT 0, 
     principal BOOLEAN DEFAULT FALSE 
 ); 
  
 CREATE TABLE IF NOT EXISTS cat_atributos ( 
     id SERIAL PRIMARY KEY, 
     nombre VARCHAR(50) NOT NULL UNIQUE 
 ); 
  
 CREATE TABLE IF NOT EXISTS cat_valores_atributo ( 
     id SERIAL PRIMARY KEY, 
     atributo_id INT NOT NULL REFERENCES cat_atributos(id) ON DELETE CASCADE, 
     valor VARCHAR(100) NOT NULL, 
     UNIQUE(atributo_id, valor) 
 ); 
  
 CREATE TABLE IF NOT EXISTS cat_producto_atributo ( 
     producto_id INT REFERENCES cat_productos(id) ON DELETE CASCADE, 
     valor_atributo_id INT REFERENCES cat_valores_atributo(id) ON DELETE CASCADE, 
     PRIMARY KEY (producto_id, valor_atributo_id) 
 ); 
  
 CREATE TABLE IF NOT EXISTS cat_producto_etiqueta ( 
     producto_id INT REFERENCES cat_productos(id) ON DELETE CASCADE, 
     etiqueta_id INT REFERENCES cat_etiquetas(id) ON DELETE CASCADE, 
     PRIMARY KEY (producto_id, etiqueta_id) 
 ); 
  
 -- ======================== 
 -- MÓDULO CLIENTES 
 -- ======================== 
  
 CREATE TABLE IF NOT EXISTS cli_clientes ( 
     id SERIAL PRIMARY KEY, 
     usuario_id INT UNIQUE NOT NULL REFERENCES seg_usuarios(id) ON DELETE CASCADE, 
     telefono VARCHAR(20), 
     puntos_acumulados INT DEFAULT 0, 
     nivel VARCHAR(20) DEFAULT 'bronce', 
     activo BOOLEAN DEFAULT TRUE, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS cli_direcciones ( 
     id SERIAL PRIMARY KEY, 
     cliente_id INT NOT NULL REFERENCES cli_clientes(id) ON DELETE CASCADE, 
     nombre_completo VARCHAR(160), 
     direccion_linea1 VARCHAR(200) NOT NULL, 
     direccion_linea2 VARCHAR(200), 
     ciudad VARCHAR(100) NOT NULL, 
     departamento VARCHAR(100), 
     codigo_postal VARCHAR(20), 
     telefono VARCHAR(20), 
     principal BOOLEAN DEFAULT FALSE, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS cli_lista_deseos ( 
     id SERIAL PRIMARY KEY, 
     cliente_id INT NOT NULL REFERENCES cli_clientes(id) ON DELETE CASCADE, 
     nombre VARCHAR(50) DEFAULT 'Lista de deseos', 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS cli_items_lista_deseos ( 
     id SERIAL PRIMARY KEY, 
     lista_id INT NOT NULL REFERENCES cli_lista_deseos(id) ON DELETE CASCADE, 
     producto_id INT NOT NULL REFERENCES cat_productos(id) ON DELETE CASCADE, 
     fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     UNIQUE(lista_id, producto_id) 
 ); 
  
 CREATE TABLE IF NOT EXISTS cli_resenas_producto ( 
     id SERIAL PRIMARY KEY, 
     producto_id INT REFERENCES cat_productos(id) ON DELETE CASCADE, 
     cliente_id INT REFERENCES cli_clientes(id) ON DELETE SET NULL, 
     calificacion INT CHECK (calificacion BETWEEN 1 AND 5), 
     comentario TEXT, 
     moderado BOOLEAN DEFAULT FALSE, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS cli_historial_navegacion ( 
     id SERIAL PRIMARY KEY, 
     cliente_id INT REFERENCES cli_clientes(id) ON DELETE CASCADE, 
     producto_id INT REFERENCES cat_productos(id) ON DELETE CASCADE, 
     fecha_visita TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 -- ======================== 
 -- MÓDULO CARRITO Y ÓRDENES 
 -- ======================== 
  
 CREATE TABLE IF NOT EXISTS ord_estados_orden ( 
     id SERIAL PRIMARY KEY, 
     nombre VARCHAR(30) NOT NULL UNIQUE, 
     codigo VARCHAR(20) UNIQUE 
 ); 
  
 CREATE TABLE IF NOT EXISTS ord_metodos_envio ( 
     id SERIAL PRIMARY KEY, 
     nombre VARCHAR(50) NOT NULL, 
     costo DECIMAL(10,2) DEFAULT 0, 
     tiempo_estimado_dias INT, 
     activo BOOLEAN DEFAULT TRUE 
 ); 
  
 CREATE TABLE IF NOT EXISTS ord_carritos ( 
     id SERIAL PRIMARY KEY, 
     cliente_id INT REFERENCES cli_clientes(id) ON DELETE SET NULL, 
     session_id VARCHAR(100), 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS ord_items_carrito ( 
     id SERIAL PRIMARY KEY, 
     carrito_id INT NOT NULL REFERENCES ord_carritos(id) ON DELETE CASCADE, 
     producto_id INT NOT NULL REFERENCES cat_productos(id) ON DELETE CASCADE, 
     cantidad INT NOT NULL CHECK (cantidad > 0), 
     variante_seleccionada JSONB, 
     precio_unitario DECIMAL(12,2) NOT NULL, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS ord_ordenes ( 
     id SERIAL PRIMARY KEY, 
     codigo VARCHAR(20) NOT NULL UNIQUE, 
     cliente_id INT NOT NULL REFERENCES cli_clientes(id), 
     estado_id INT NOT NULL REFERENCES ord_estados_orden(id), 
     subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0), 
     impuestos DECIMAL(12,2) NOT NULL DEFAULT 0, 
     total DECIMAL(12,2) NOT NULL CHECK (total >= 0), 
     direccion_envio_id INT REFERENCES cli_direcciones(id), 
     metodo_envio_id INT REFERENCES ord_metodos_envio(id), 
     metodo_pago VARCHAR(50), 
     pago_referencia VARCHAR(100), 
     fecha_orden TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     fecha_pago TIMESTAMP, 
     fecha_envio TIMESTAMP, 
     fecha_entrega TIMESTAMP, 
     notas TEXT, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS ord_items_orden ( 
     id SERIAL PRIMARY KEY, 
     orden_id INT NOT NULL REFERENCES ord_ordenes(id) ON DELETE CASCADE, 
     producto_id INT NOT NULL REFERENCES cat_productos(id), 
     cantidad INT NOT NULL CHECK (cantidad > 0), 
     precio_unitario DECIMAL(12,2) NOT NULL, 
     subtotal DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED, 
     variante_seleccionada JSONB 
 ); 
  
 CREATE TABLE IF NOT EXISTS ord_historial_estados ( 
     id SERIAL PRIMARY KEY, 
     orden_id INT NOT NULL REFERENCES ord_ordenes(id) ON DELETE CASCADE, 
     estado_id INT NOT NULL REFERENCES ord_estados_orden(id), 
     usuario_id INT REFERENCES seg_usuarios(id), 
     comentario TEXT, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS ord_pagos ( 
     id SERIAL PRIMARY KEY, 
     orden_id INT NOT NULL REFERENCES ord_ordenes(id) ON DELETE CASCADE, 
     monto DECIMAL(12,2) NOT NULL, 
     metodo_pago VARCHAR(50), 
     referencia VARCHAR(100), 
     estado VARCHAR(20) DEFAULT 'pendiente', 
     fecha_pago TIMESTAMP, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS ord_transacciones_pago ( 
     id SERIAL PRIMARY KEY, 
     pago_id INT REFERENCES ord_pagos(id) ON DELETE CASCADE, 
     transaccion_id VARCHAR(100) UNIQUE, 
     gateway_respuesta JSONB, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 -- ======================== 
 -- MÓDULO INVENTARIO 
 -- ======================== 
  
 CREATE TABLE IF NOT EXISTS inv_proveedores ( 
     id SERIAL PRIMARY KEY, 
     razon_social VARCHAR(120) NOT NULL, 
     ruc VARCHAR(20) UNIQUE, 
     email VARCHAR(100), 
     telefono VARCHAR(20), 
     direccion TEXT, 
     activo BOOLEAN DEFAULT TRUE, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS inv_stock_producto ( 
     id SERIAL PRIMARY KEY, 
     producto_id INT NOT NULL UNIQUE REFERENCES cat_productos(id) ON DELETE CASCADE, 
     stock_fisico INT NOT NULL DEFAULT 0 CHECK (stock_fisico >= 0), 
     stock_reservado INT NOT NULL DEFAULT 0 CHECK (stock_reservado >= 0), 
     stock_disponible INT GENERATED ALWAYS AS (stock_fisico - stock_reservado) STORED, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS inv_movimientos_inventario ( 
     id SERIAL PRIMARY KEY, 
     producto_id INT NOT NULL REFERENCES cat_productos(id), 
     tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada','salida','ajuste','reserva','liberacion')), 
     cantidad INT NOT NULL, 
     motivo VARCHAR(100), 
     orden_venta_id INT REFERENCES ord_ordenes(id) ON DELETE SET NULL, 
     orden_compra_id INT, 
     usuario_id INT REFERENCES seg_usuarios(id), 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS inv_ajustes ( 
     id SERIAL PRIMARY KEY, 
     codigo VARCHAR(20) UNIQUE, 
     motivo VARCHAR(100), 
     usuario_id INT REFERENCES seg_usuarios(id), 
     fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS inv_detalle_ajuste ( 
     id SERIAL PRIMARY KEY, 
     ajuste_id INT REFERENCES inv_ajustes(id) ON DELETE CASCADE, 
     producto_id INT REFERENCES cat_productos(id), 
     cantidad INT NOT NULL, 
     tipo_ajuste VARCHAR(10) CHECK (tipo_ajuste IN ('positivo','negativo')) 
 ); 
  
 CREATE TABLE IF NOT EXISTS inv_ordenes_compra ( 
     id SERIAL PRIMARY KEY, 
     proveedor_id INT REFERENCES inv_proveedores(id), 
     fecha_orden DATE, 
     fecha_esperada DATE, 
     estado VARCHAR(20) DEFAULT 'pendiente', 
     total DECIMAL(12,2), 
     created_by INT REFERENCES seg_usuarios(id), 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS inv_detalle_orden_compra ( 
     id SERIAL PRIMARY KEY, 
     orden_compra_id INT REFERENCES inv_ordenes_compra(id) ON DELETE CASCADE, 
     producto_id INT REFERENCES cat_productos(id), 
     cantidad INT NOT NULL CHECK (cantidad > 0), 
     precio_unitario DECIMAL(12,2) NOT NULL CHECK (precio_unitario >= 0) 
 ); 
  
 CREATE TABLE IF NOT EXISTS inv_recepciones ( 
     id SERIAL PRIMARY KEY, 
     orden_compra_id INT REFERENCES inv_ordenes_compra(id), 
     fecha_recepcion DATE, 
     usuario_id INT REFERENCES seg_usuarios(id), 
     observaciones TEXT, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 -- ======================== 
 -- MÓDULO TRANSVERSAL 
 -- ======================== 
  
 CREATE TABLE IF NOT EXISTS monedas ( 
     id SERIAL PRIMARY KEY, 
     codigo VARCHAR(3) NOT NULL UNIQUE, 
     nombre VARCHAR(30), 
     simbolo VARCHAR(5), 
     activo BOOLEAN DEFAULT TRUE 
 ); 
  
 CREATE TABLE IF NOT EXISTS tipo_cambio ( 
     id SERIAL PRIMARY KEY, 
     moneda_origen_id INT REFERENCES monedas(id), 
     moneda_destino_id INT REFERENCES monedas(id), 
     tasa DECIMAL(12,4), 
     fecha DATE DEFAULT CURRENT_DATE 
 ); 
  
 CREATE TABLE IF NOT EXISTS configuracion_sistema ( 
     clave VARCHAR(50) PRIMARY KEY, 
     valor TEXT, 
     descripcion TEXT, 
     actualizado_por INT REFERENCES seg_usuarios(id), 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 CREATE TABLE IF NOT EXISTS auditoria_registro ( 
     id BIGSERIAL PRIMARY KEY, 
     usuario_id INT REFERENCES seg_usuarios(id), 
     accion VARCHAR(20), 
     modulo VARCHAR(50), 
     tabla_afectada VARCHAR(50), 
     registro_id INT, 
     datos_anteriores JSONB, 
     datos_nuevos JSONB, 
     ip_address INET, 
     user_agent TEXT, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
  
 -- ======================== 
 -- ÍNDICES 
 -- ======================== 
  
 CREATE INDEX IF NOT EXISTS idx_productos_categoria ON cat_productos(categoria_id); 
 CREATE INDEX IF NOT EXISTS idx_productos_marca ON cat_productos(marca_id); 
 CREATE INDEX IF NOT EXISTS idx_productos_sku ON cat_productos(sku); 
 CREATE INDEX IF NOT EXISTS idx_productos_activo ON cat_productos(activo); 
 CREATE INDEX IF NOT EXISTS idx_ordenes_cliente ON ord_ordenes(cliente_id); 
 CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ord_ordenes(estado_id); 
 CREATE INDEX IF NOT EXISTS idx_ordenes_fecha ON ord_ordenes(fecha_orden); 
 CREATE INDEX IF NOT EXISTS idx_carrito_cliente ON ord_carritos(cliente_id); 
 CREATE INDEX IF NOT EXISTS idx_carrito_session ON ord_carritos(session_id); 
 CREATE INDEX IF NOT EXISTS idx_inv_movimientos_producto ON inv_movimientos_inventario(producto_id); 
 CREATE INDEX IF NOT EXISTS idx_inv_movimientos_tipo ON inv_movimientos_inventario(tipo); 
 CREATE INDEX IF NOT EXISTS idx_usuarios_email ON seg_usuarios(email); 
 CREATE INDEX IF NOT EXISTS idx_refresh_token ON refresh_tokens(token); 
 CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria_registro(usuario_id); 
 CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria_registro(created_at); 
  
 -- ======================== 
 -- DATOS SEMILLA 
 -- ======================== 
  
 INSERT INTO seg_roles (nombre, descripcion) VALUES 
 ('cliente', 'Comprador del sistema'), 
 ('administrador', 'Acceso total al sistema'), 
 ('gerente_ventas', 'Gestión de ventas y reportes'), 
 ('gerente_inventario', 'Gestión de productos e inventario'), 
 ('vendedor', 'Atención al cliente y órdenes') 
 ON CONFLICT (nombre) DO NOTHING; 
  
 INSERT INTO seg_permisos (modulo, accion) VALUES 
 ('productos', 'leer'), ('productos', 'crear'), ('productos', 'editar'), ('productos', 'eliminar'), 
 ('ordenes', 'leer'), ('ordenes', 'cambiar_estado'), ('ordenes', 'cancelar'), 
 ('clientes', 'leer'), ('clientes', 'editar'), 
 ('inventario', 'gestionar'), 
 ('reportes', 'generar'), 
 ('dashboard', 'ver'), 
 ('usuarios', 'gestionar') 
 ON CONFLICT (modulo, accion) DO NOTHING; 
  
 -- Asignar todos los permisos al administrador (rol id 2) 
 INSERT INTO seg_rol_permiso (rol_id, permiso_id) 
 SELECT 2, id FROM seg_permisos 
 ON CONFLICT DO NOTHING; 
  
 INSERT INTO ord_estados_orden (nombre, codigo) VALUES 
 ('Pendiente pago', 'PENDING_PAY'), 
 ('Pagada', 'PAID'), 
 ('En proceso', 'PROCESSING'), 
 ('Enviada', 'SHIPPED'), 
 ('Entregada', 'DELIVERED'), 
 ('Cancelada', 'CANCELLED'), 
 ('Devuelta', 'RETURNED') 
 ON CONFLICT (nombre) DO NOTHING; 
  
 INSERT INTO ord_metodos_envio (nombre, costo, tiempo_estimado_dias) VALUES 
 ('Envío estándar', 5.00, 5), 
 ('Envío express', 15.00, 2), 
 ('Recojo en tienda', 0.00, 0) 
 ON CONFLICT DO NOTHING; 
  
 INSERT INTO cat_categorias (nombre, slug) VALUES 
 ('Electrónica', 'electronica'), 
 ('Accesorios', 'accesorios'), 
 ('Oficina', 'oficina'), 
 ('Hogar', 'hogar'), 
 ('Deportes', 'deportes'), 
 ('Ropa', 'ropa') 
 ON CONFLICT (nombre) DO NOTHING; 
  
 INSERT INTO cat_marcas (nombre) VALUES 
 ('Samsung'), ('Nike'), ('Sony'), ('Adidas'), ('HP'), ('Logitech'), ('Generic') 
 ON CONFLICT (nombre) DO NOTHING; 
  
 INSERT INTO cat_unidades_medida (nombre, abreviatura) VALUES 
 ('Unidad', 'u'), ('Par', 'par'), ('Kilogramo', 'kg'), ('Litro', 'lt') 
 ON CONFLICT (nombre) DO NOTHING; 
  
 INSERT INTO monedas (codigo, nombre, simbolo) VALUES 
 ('PEN', 'Sol Peruano', 'S/.'), 
 ('USD', 'Dólar Americano', '$'), 
 ('EUR', 'Euro', '€') 
 ON CONFLICT (codigo) DO NOTHING; 
  
 INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES 
 ('igv_porcentaje', '18', 'Porcentaje de IGV aplicado a ventas'), 
 ('moneda_default', 'PEN', 'Moneda por defecto del sistema'), 
 ('empresa_nombre', 'Mi Empresa SAC', 'Nombre de la empresa'), 
 ('empresa_ruc', '20000000001', 'RUC de la empresa'), 
 ('empresa_direccion', 'Av. Principal 123, Lima', 'Dirección de la empresa'), 
 ('stock_alerta_automatica', 'true', 'Enviar alerta cuando stock baje del mínimo'), 
 ('checkout_timeout_min', '15', 'Minutos para timeout del checkout'), 
 ('max_items_carrito', '20', 'Máximo de items distintos en el carrito') 
 ON CONFLICT (clave) DO NOTHING; 
  
 -- Admin por defecto (password: Admin123!) 
 -- CAMBIAR EN PRODUCCIÓN 
 INSERT INTO seg_usuarios (email, password_hash, nombre, apellido, rol_id, email_verificado) VALUES 
 ('admin@sistema.com', '$2b$10$EEu8g3reeSrqxTntibyokOB1GZF4Pnl6bJLax8HoyoSaY.D35.NeC', 'Admin', 'Sistema', 2, true) 
 ON CONFLICT (email) DO NOTHING;
