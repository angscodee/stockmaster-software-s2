-- Create Database if not exists (usually handled by the hosting environment)
-- CREATE DATABASE product_management;

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL,
    precio_compra DECIMAL(10, 2) NOT NULL DEFAULT 0,
    precio_venta DECIMAL(10, 2) NOT NULL DEFAULT 0,
    stock_actual INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 10,
    proveedor VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data
INSERT INTO products (sku, nombre, descripcion, categoria, precio_compra, precio_venta, stock_actual, stock_minimo, proveedor)
VALUES 
('LAP-001', 'Laptop Pro 15', 'High performance laptop for professionals', 'Electrónica', 800.00, 1200.00, 15, 5, 'TechSupply Inc.'),
('MOU-002', 'Wireless Mouse', 'Ergonomic wireless mouse', 'Accesorios', 15.00, 35.00, 50, 10, 'LogiPartners'),
('MON-003', '4K Monitor 27"', 'Ultra HD monitor for design', 'Electrónica', 200.00, 450.00, 8, 10, 'ScreenMasters'),
('KBD-004', 'Mechanical Keyboard', 'RGB mechanical keyboard', 'Accesorios', 45.00, 95.00, 20, 5, 'KeyPro'),
('PRN-005', 'Laser Printer', 'Fast laser printer for office', 'Oficina', 120.00, 250.00, 4, 5, 'PrintSolutions');
