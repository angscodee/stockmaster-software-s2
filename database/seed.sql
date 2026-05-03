-- Limpiar datos existentes (opcional, pero útil para pruebas limpias)
TRUNCATE TABLE products RESTART IDENTITY;

-- Insertar 15+ productos variados
INSERT INTO products (sku, nombre, descripcion, categoria, precio_compra, precio_venta, stock_actual, stock_minimo, proveedor)
VALUES 
-- Electrónica
('ELE-001', 'Smartphone Galaxy S23', 'Teléfono inteligente de alta gama', 'Electrónica', 600.00, 899.99, 12, 5, 'Samsung Electronics'),
('ELE-002', 'Audífonos Bluetooth Noise Cancelling', 'Audífonos con cancelación de ruido activa', 'Electrónica', 120.00, 249.99, 3, 10, 'Sony Corp'), -- BAJO STOCK
('ELE-003', 'Cámara Mirrorless 4K', 'Cámara profesional para video y foto', 'Electrónica', 1100.00, 1599.00, 8, 5, 'Canon Latin'),

-- Muebles
('MUE-001', 'Escritorio Ergonómico', 'Escritorio ajustable en altura', 'Muebles', 150.00, 299.00, 20, 10, 'Office Depot'),
('MUE-002', 'Silla de Oficina Mesh', 'Silla transpirable con soporte lumbar', 'Muebles', 80.00, 159.00, 4, 15, 'Muebles del Centro'), -- BAJO STOCK
('MUE-003', 'Lámpara de Pie LED', 'Iluminación moderna para oficina', 'Muebles', 25.00, 55.00, 35, 10, 'LightHouse'),

-- Útiles
('UTI-001', 'Set de Marcadores (24 colores)', 'Marcadores permanentes punta fina', 'Útiles', 15.00, 29.50, 50, 20, 'Faber Castell'),
('UTI-002', 'Cuaderno Profesional Rayado', 'Cuaderno de 100 hojas pasta dura', 'Útiles', 2.50, 6.00, 100, 50, 'Scribe'),
('UTI-003', 'Calculadora Científica', 'Calculadora con funciones avanzadas', 'Útiles', 18.00, 35.00, 2, 5, 'Casio'), -- BAJO STOCK

-- Ropa
('ROP-001', 'Camiseta Algodón Orgánico', 'Camiseta básica blanca unisex', 'Ropa', 8.00, 19.99, 60, 25, 'Textiles Modernos'),
('ROP-002', 'Chaqueta Impermeable', 'Chaqueta ligera para lluvia', 'Ropa', 35.00, 75.00, 15, 10, 'Outdoor Gear'),
('ROP-003', 'Pantalones Denim Slim Fit', 'Jeans azul clásico para hombre', 'Ropa', 20.00, 49.90, 8, 20, 'Levi Straus'), -- BAJO STOCK

-- Alimentos
('ALI-001', 'Café en Grano (1kg)', 'Café de altura tostado medio', 'Alimentos', 12.00, 24.00, 40, 15, 'Café Selecto'),
('ALI-002', 'Aceite de Oliva Extra Virgen', 'Botella de 500ml prensado en frío', 'Alimentos', 7.50, 14.99, 5, 10, 'Gourmet Imports'), -- BAJO STOCK
('ALI-003', 'Chocolate Amargo 70% Cacao', 'Barra de chocolate artesanal', 'Alimentos', 3.00, 6.50, 120, 30, 'Cacao Real');
