-- ================================================================
-- SCRIPT FINAL — Solo correcciones pendientes confirmadas
-- ================================================================

-- 1. Agregar columna 'fecha' a cli_resenas_producto (IF NOT EXISTS es idempotente)
ALTER TABLE cli_resenas_producto 
    ADD COLUMN IF NOT EXISTS fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. UNIQUE constraint en ord_items_carrito
ALTER TABLE ord_items_carrito 
    DROP CONSTRAINT IF EXISTS uq_carrito_producto_variante;

ALTER TABLE ord_items_carrito 
    ADD CONSTRAINT uq_carrito_producto_variante 
    UNIQUE (carrito_id, producto_id, variante_seleccionada);

-- 3. Índice GIN full-text en cat_productos(nombre)
DROP INDEX IF EXISTS idx_productos_nombre;
CREATE INDEX idx_productos_nombre 
    ON cat_productos USING GIN (to_tsvector('spanish', nombre));

-- 4. Índice en ord_pagos(orden_id)
CREATE INDEX IF NOT EXISTS idx_pagos_orden 
    ON ord_pagos(orden_id);

-- 5. Índice en cli_resenas_producto(producto_id)
CREATE INDEX IF NOT EXISTS idx_resenas_producto 
    ON cli_resenas_producto(producto_id);

-- ================================================================
-- CONFIRMACIÓN FINAL
-- ================================================================
SELECT 
    'EXTENSIONES' AS tipo,
    extname AS nombre
FROM pg_extension 
WHERE extname = 'pg_trgm'
UNION ALL
SELECT 
    'TABLA refresh_token' AS tipo,
    column_name AS nombre
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'refresh_token'
UNION ALL
SELECT 
    'COLUMNA fecha en resenas' AS tipo,
    column_name AS nombre
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'cli_resenas_producto' AND column_name = 'fecha'
UNION ALL
SELECT 
    'CONSTRAINT carrito' AS tipo,
    constraint_name AS nombre
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'ord_items_carrito' AND constraint_name = 'uq_carrito_producto_variante'
UNION ALL
SELECT 
    'INDICE' AS tipo,
    indexname AS nombre
FROM pg_indexes
WHERE schemaname = 'public' 
  AND indexname IN ('idx_productos_nombre', 'idx_pagos_orden', 'idx_resenas_producto');
