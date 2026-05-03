-- ================================================================
-- DIAGNÓSTICO: Estado actual de las correcciones
-- ================================================================

-- 1. Verificar si existe refresh_token o refresh_tokens
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('refresh_token', 'refresh_tokens');

-- 2. Verificar columnas de la tabla refresh_token/tokens
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('refresh_token', 'refresh_tokens')
ORDER BY table_name, ordinal_position;

-- 3. Verificar si existe columna 'fecha' en cli_resenas_producto
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'cli_resenas_producto';

-- 4. Verificar constraints en ord_items_carrito
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name = 'ord_items_carrito';

-- 5. Verificar índices existentes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_productos_nombre',
    'idx_pagos_orden', 
    'idx_resenas_producto',
    'uq_carrito_producto_variante'
  );

-- 6. Verificar extensión pg_trgm
SELECT extname FROM pg_extension WHERE extname = 'pg_trgm';
