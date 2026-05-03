BEGIN;

-- 20 productos de ejemplo 
INSERT INTO cat_productos (sku, nombre, descripcion_corta, descripcion_larga, categoria_id, marca_id, unidad_medida_id, precio_costo, precio_venta, stock_minimo, activo, created_at, updated_at) 
SELECT sku, nombre, descripcion_corta, descripcion_larga, categoria_id, marca_id, unidad_medida_id, precio_costo, precio_venta, stock_minimo, activo, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM (VALUES 
  ('LAP-001', 'Laptop Pro 15', 'Laptop de alto rendimiento', 'Procesador Intel Core i7, 16GB RAM, 512GB SSD', 1, 1, 1, 800.00, 1200.00, 5, true), 
  ('MOU-002', 'Mouse Inalámbrico', 'Mouse ergonómico inalámbrico', 'Conectividad 2.4GHz, batería 12 meses', 2, 6, 1, 15.00, 35.00, 10, true), 
  ('MON-003', 'Monitor 4K 27"', 'Monitor Ultra HD para diseño', 'Panel IPS, 144Hz, HDR400', 1, 1, 1, 200.00, 450.00, 3, true), 
  ('KBD-004', 'Teclado Mecánico', 'Teclado mecánico RGB', 'Switches Blue, retroiluminación RGB', 2, 6, 1, 45.00, 95.00, 5, true), 
  ('PRN-005', 'Impresora Láser', 'Impresora rápida para oficina', '30 ppm, duplex automático', 3, 5, 1, 120.00, 250.00, 2, true), 
  ('CAM-006', 'Cámara Web HD', 'Cámara web Full HD', '1080p 30fps, micrófono integrado', 2, 1, 1, 30.00, 75.00, 8, true), 
  ('HUB-007', 'Hub USB 7 puertos', 'Concentrador USB 3.0', '7 puertos USB 3.0, alimentación externa', 2, 7, 1, 12.00, 28.00, 10, true), 
  ('SSD-008', 'SSD 1TB Externo', 'Disco externo SSD', 'USB 3.1 Gen2, 1000MB/s lectura', 1, 1, 1, 80.00, 150.00, 5, true), 
  ('SPK-009', 'Parlantes 2.1', 'Sistema de sonido 2.1', '60W RMS, bass reflex', 1, 3, 1, 40.00, 90.00, 5, true), 
  ('RTR-010', 'Router WiFi 6', 'Router de alta velocidad', 'AX3000, dual band, 4 antenas', 1, 1, 1, 60.00, 130.00, 3, true), 
  ('DES-011', 'Escritorio Standing', 'Escritorio ajustable en altura', 'Marco metálico, altura 70-120cm', 3, 7, 1, 150.00, 320.00, 2, true), 
  ('SLL-012', 'Silla Ergonómica', 'Silla de oficina ergonómica', 'Soporte lumbar, apoyabrazos ajustables', 3, 7, 1, 120.00, 280.00, 2, true), 
  ('LMP-013', 'Lámpara LED Escritorio', 'Lámpara LED con USB', '3 niveles de brillo, puerto USB', 3, 7, 1, 15.00, 35.00, 8, true), 
  ('PHN-014', 'Smartphone Android', 'Teléfono de gama media', '6.5", 128GB, 5000mAh', 1, 1, 1, 180.00, 350.00, 5, true), 
  ('TAB-015', 'Tablet 10"', 'Tablet para trabajo y ocio', '10.1", 64GB, WiFi+4G', 1, 1, 1, 150.00, 280.00, 3, true), 
  ('PWR-016', 'Power Bank 20000mAh', 'Batería portátil grande', '20000mAh, carga rápida 18W', 2, 7, 1, 20.00, 45.00, 10, true), 
  ('CBL-017', 'Cable HDMI 2m', 'Cable HDMI 4K', 'HDMI 2.0, 4K@60Hz, 2 metros', 2, 7, 1, 5.00, 12.00, 20, true), 
  ('MIC-018', 'Micrófono USB', 'Micrófono condensador USB', 'Cardioide, soporte de escritorio', 2, 7, 1, 25.00, 60.00, 5, true), 
  ('PAD-019', 'Mousepad XL', 'Alfombrilla gaming grande', '90x40cm, base antideslizante', 2, 7, 1, 8.00, 20.00, 15, true), 
  ('UPS-020', 'UPS 1200VA', 'Sistema de respaldo eléctrico', '1200VA/720W, 8 tomacorrientes', 3, 7, 1, 90.00, 180.00, 3, true) 
) AS t(sku, nombre, descripcion_corta, descripcion_larga, categoria_id, marca_id, unidad_medida_id, precio_costo, precio_venta, stock_minimo, activo) 
WHERE NOT EXISTS (SELECT 1 FROM cat_productos WHERE sku = t.sku); 
  
-- Stock inicial para todos los productos 
INSERT INTO inv_stock_producto (producto_id, stock_fisico, updated_at) 
SELECT id, FLOOR(RANDOM() * 91 + 10)::INT, CURRENT_TIMESTAMP
FROM cat_productos 
ON CONFLICT (producto_id) DO NOTHING; 
  
-- Proveedores de ejemplo 
INSERT INTO inv_proveedores (razon_social, ruc, email, telefono) VALUES 
('TechSupply Peru SAC', '20123456789', 'ventas@techsupply.pe', '01-234-5678'), 
('LogiPartners SAC', '20234567890', 'info@logipartners.pe', '01-345-6789'), 
('ScreenMasters Peru', '20345678901', 'contacto@screenmasters.pe', '01-456-7890') 
ON CONFLICT (ruc) DO NOTHING; 
  
COMMIT;
