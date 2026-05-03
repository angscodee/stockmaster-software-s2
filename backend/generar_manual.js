require('dotenv').config();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ─── Constantes de layout ────────────────────────────────────────────────────
const W       = 595.28;   // A4 ancho
const H       = 841.89;   // A4 alto
const M       = 50;       // margen
const CW      = W - M*2;  // ancho contenido
const BLUE    = '#1e40af';
const LBLUE   = '#dbeafe';
const GRAY    = '#6b7280';
const DARK    = '#1f2937';
const GREEN   = '#16a34a';
const RED     = '#dc2626';
const YELLOW  = '#d97706';
const WHITE   = '#ffffff';
const BGLIGHT = '#f8fafc';

const doc = new PDFDocument({ size: 'A4', margin: M, autoFirstPage: false });
const out = fs.createWriteStream(path.join(__dirname, 'manual_stockmaster.pdf'));
doc.pipe(out);

let pageNum = 0;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function newPage(showHeader = true) {
  doc.addPage();
  pageNum++;
  if (showHeader) {
    // Barra superior
    doc.rect(0, 0, W, 6).fill(BLUE);
    // Número de página
    doc.fontSize(8).fillColor(GRAY).font('Helvetica')
       .text(`StockMaster — Manual de Usuario   |   Pág. ${pageNum}`, M, H - 30, { width: CW, align: 'right' });
    doc.moveTo(M, H - 20).lineTo(W - M, H - 20).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
  }
}

function sectionTitle(text, y) {
  doc.rect(M, y, CW, 28).fill(BLUE);
  doc.fontSize(12).fillColor(WHITE).font('Helvetica-Bold')
     .text(text, M + 12, y + 8, { width: CW - 24 });
  return y + 38;
}

function subTitle(text, y) {
  doc.fontSize(11).fillColor(BLUE).font('Helvetica-Bold').text(text, M, y);
  doc.moveTo(M, y + 14).lineTo(W - M, y + 14).strokeColor(LBLUE).lineWidth(1).stroke();
  return y + 22;
}

function body(text, y, opts = {}) {
  doc.fontSize(9).fillColor(DARK).font('Helvetica')
     .text(text, M, y, { width: CW, lineGap: 3, ...opts });
  return doc.y + 6;
}

function bullet(text, y, color = BLUE) {
  doc.circle(M + 5, y + 4, 3).fill(color);
  doc.fontSize(9).fillColor(DARK).font('Helvetica')
     .text(text, M + 16, y, { width: CW - 16, lineGap: 2 });
  return doc.y + 4;
}

function infoBox(label, text, y, color = LBLUE, textColor = BLUE) {
  const boxH = 36;
  doc.rect(M, y, CW, boxH).fill(color);
  doc.fontSize(8).fillColor(textColor).font('Helvetica-Bold').text(label.toUpperCase(), M + 10, y + 6);
  doc.fontSize(9).fillColor(DARK).font('Helvetica').text(text, M + 10, y + 18, { width: CW - 20 });
  return y + boxH + 8;
}

function screenshotBox(label, y, h = 120) {
  doc.rect(M, y, CW, h).fill('#f1f5f9').stroke('#cbd5e1');
  doc.rect(M, y, CW, 20).fill('#e2e8f0');
  doc.fontSize(8).fillColor(GRAY).font('Helvetica-Bold')
     .text(`📸  CAPTURA: ${label}`, M + 8, y + 6, { width: CW - 16 });
  doc.fontSize(8).fillColor('#94a3b8').font('Helvetica')
     .text('[ Insertar captura de pantalla aquí ]', M, y + h/2 - 6, { width: CW, align: 'center' });
  return y + h + 12;
}

function flowStep(num, text, x, y, w = 90, active = false) {
  doc.rect(x, y, w, 32).fill(active ? BLUE : LBLUE).stroke(active ? BLUE : '#93c5fd');
  doc.fontSize(8).fillColor(active ? WHITE : BLUE).font('Helvetica-Bold')
     .text(`${num}`, x + 4, y + 4, { width: 14 });
  doc.fontSize(7.5).fillColor(active ? WHITE : DARK).font('Helvetica')
     .text(text, x + 18, y + 6, { width: w - 22, lineGap: 1 });
}

function arrow(x1, y1, x2, y2) {
  doc.moveTo(x1, y1).lineTo(x2, y2).strokeColor('#93c5fd').lineWidth(1.5).stroke();
  // punta
  doc.polygon([x2, y2], [x2 - 5, y2 - 4], [x2 - 5, y2 + 4]).fill('#93c5fd');
}

function kpiBox(label, value, x, y, w, color = BLUE) {
  doc.rect(x, y, w, 52).fill(BGLIGHT).stroke('#e2e8f0');
  doc.rect(x, y, w, 4).fill(color);
  doc.fontSize(8).fillColor(GRAY).font('Helvetica').text(label.toUpperCase(), x + 8, y + 12, { width: w - 16 });
  doc.fontSize(16).fillColor(color).font('Helvetica-Bold').text(value, x + 8, y + 24, { width: w - 16 });
}

function codeBlock(lines, y) {
  const h = lines.length * 13 + 16;
  doc.rect(M, y, CW, h).fill('#0f172a');
  doc.rect(M, y, CW, 14).fill('#1e293b');
  doc.fontSize(7).fillColor('#94a3b8').font('Helvetica').text('TERMINAL', M + 8, y + 4);
  lines.forEach((line, i) => {
    const color = line.startsWith('#') ? '#64748b' : line.startsWith('$') ? '#86efac' : '#e2e8f0';
    doc.fontSize(8).fillColor(color).font('Helvetica').text(line, M + 10, y + 18 + i * 13);
  });
  return y + h + 10;
}

function tableHeader(cols, y) {
  doc.rect(M, y, CW, 20).fill(BLUE);
  let x = M;
  cols.forEach(col => {
    doc.fontSize(8).fillColor(WHITE).font('Helvetica-Bold')
       .text(col.label, x + 4, y + 6, { width: col.w - 8, align: col.align || 'left' });
    x += col.w;
  });
  return y + 20;
}

function tableRow(cols, values, y, alt = false) {
  doc.rect(M, y, CW, 18).fill(alt ? BGLIGHT : WHITE);
  let x = M;
  cols.forEach((col, i) => {
    const val = values[i] || '';
    const color = col.color ? col.color(val) : DARK;
    doc.fontSize(8).fillColor(color).font('Helvetica')
       .text(String(val), x + 4, y + 5, { width: col.w - 8, align: col.align || 'left', ellipsis: true });
    x += col.w;
  });
  return y + 18;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PORTADA
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage();
pageNum++;

// Fondo degradado simulado
doc.rect(0, 0, W, H).fill('#f0f4ff');
doc.rect(0, 0, W, 320).fill(BLUE);

// Logo / nombre
doc.fontSize(42).fillColor(WHITE).font('Helvetica-Bold').text('StockMaster', M, 90, { width: CW, align: 'center' });
doc.fontSize(14).fillColor('#bfdbfe').font('Helvetica').text('Sistema de Gestión de Inventario y E-Commerce', M, 148, { width: CW, align: 'center' });

// Línea decorativa
doc.moveTo(W/2 - 60, 178).lineTo(W/2 + 60, 178).strokeColor('#60a5fa').lineWidth(2).stroke();

doc.fontSize(11).fillColor('#dbeafe').font('Helvetica').text('Manual de Usuario — Guía Completa del Sistema', M, 192, { width: CW, align: 'center' });

// Versión y fecha
doc.rect(W/2 - 80, 230, 160, 36).fill('rgba(255,255,255,0.15)');
doc.fontSize(9).fillColor(WHITE).font('Helvetica-Bold').text('Versión 1.0  |  2025', W/2 - 80, 244, { width: 160, align: 'center' });

// Módulos cubiertos
const modulos = ['Catálogo & Productos', 'Carrito & Checkout', 'Pasarela de Pago', 'Gestión de Órdenes', 'Control de Inventario', 'Reportes PDF'];
const mW = (CW - 20) / 3;
modulos.forEach((mod, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = M + col * (mW + 10);
  const y = 360 + row * 60;
  doc.rect(x, y, mW, 44).fill(WHITE).stroke('#e2e8f0');
  doc.rect(x, y, mW, 4).fill(BLUE);
  doc.fontSize(9).fillColor(DARK).font('Helvetica-Bold').text(mod, x + 8, y + 14, { width: mW - 16, align: 'center' });
});

doc.fontSize(8).fillColor(GRAY).font('Helvetica')
   .text('Documento de uso interno — StockMaster © 2025', M, H - 40, { width: CW, align: 'center' });

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 2 — ÍNDICE
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
let y = 30;
y = sectionTitle('Tabla de Contenidos', y);
y += 8;

const toc = [
  ['1.', 'Introducción y Arquitectura del Sistema', '3'],
  ['2.', 'Instalación y Configuración Inicial', '4'],
  ['3.', 'Proceso de Compra — Vista del Cliente', '5'],
  ['  3.1', 'Catálogo y búsqueda de productos', '5'],
  ['  3.2', 'Validación de stock en tiempo real', '6'],
  ['  3.3', 'Carrito de compras', '7'],
  ['  3.4', 'Pasarela de pago (Yape / Plin / Tarjeta)', '8'],
  ['  3.5', 'Confirmación y ticket de compra', '9'],
  ['4.', 'Panel de Administración', '10'],
  ['  4.1', 'Dashboard y KPIs', '10'],
  ['  4.2', 'Gestión de productos e imágenes', '11'],
  ['  4.3', 'Detalle de órdenes', '12'],
  ['  4.4', 'Control de inventario y ajustes', '13'],
  ['  4.5', 'Reportes PDF — Inventario en rojo', '14'],
  ['5.', 'Flujo Completo de una Orden', '15'],
  ['6.', 'Referencia de API', '16'],
];

toc.forEach(([num, title, page], i) => {
  const isMain = !num.startsWith(' ');
  const rowY = y + i * 22;
  if (i % 2 === 0) doc.rect(M, rowY, CW, 22).fill(BGLIGHT);
  doc.fontSize(isMain ? 10 : 9)
     .fillColor(isMain ? BLUE : DARK)
     .font(isMain ? 'Helvetica-Bold' : 'Helvetica')
     .text(num, M + 8, rowY + 6, { width: 30 });
  doc.fontSize(isMain ? 10 : 9)
     .fillColor(isMain ? BLUE : DARK)
     .font(isMain ? 'Helvetica-Bold' : 'Helvetica')
     .text(title, M + 42, rowY + 6, { width: CW - 80 });
  doc.fontSize(9).fillColor(GRAY).font('Helvetica')
     .text(page, M + CW - 30, rowY + 6, { width: 28, align: 'right' });
  // línea punteada
  doc.moveTo(M + 42 + doc.widthOfString(title, { fontSize: isMain ? 10 : 9 }) + 5, rowY + 13)
     .lineTo(M + CW - 35, rowY + 13)
     .dash(2, { space: 3 }).strokeColor('#cbd5e1').lineWidth(0.5).stroke().undash();
});

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 3 — INTRODUCCIÓN Y ARQUITECTURA
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
y = 30;
y = sectionTitle('1. Introducción y Arquitectura del Sistema', y);
y += 6;

y = body('StockMaster es una plataforma fullstack de gestión de inventario y e-commerce que combina un panel administrativo completo con una tienda online para clientes. El sistema maneja el ciclo completo: desde la publicación de productos hasta la generación de comprobantes de venta.', y);
y += 8;

y = subTitle('Stack Tecnológico', y);
y += 4;

const stack = [
  ['Frontend', 'React 18 + TypeScript + Vite + TailwindCSS + React Query'],
  ['Backend', 'Node.js + Express.js + Sequelize ORM'],
  ['Base de datos', 'PostgreSQL 14+'],
  ['Autenticación', 'JWT (Access Token 1h + Refresh Token 7d)'],
  ['Archivos', 'Multer — almacenamiento local en /uploads/productos'],
  ['PDFs', 'PDFKit — generación server-side de reportes y tickets'],
];

const sCols = [{ label: 'Capa', w: 120 }, { label: 'Tecnología', w: CW - 120 }];
y = tableHeader(sCols, y);
stack.forEach(([capa, tech], i) => {
  y = tableRow(sCols, [capa, tech], y, i % 2 === 0);
});
y += 14;

y = subTitle('Arquitectura de Capas', y);
y += 8;

// Diagrama de arquitectura
const layers = [
  { label: 'CLIENTE (Navegador)', sub: 'React + Zustand + React Query', color: '#1e40af', bg: '#dbeafe' },
  { label: 'API REST (Express)', sub: 'Rutas → Middleware JWT → Controllers', color: '#7c3aed', bg: '#ede9fe' },
  { label: 'CAPA DE DATOS (Sequelize)', sub: 'Models → Associations → Transactions', color: '#065f46', bg: '#d1fae5' },
  { label: 'BASE DE DATOS (PostgreSQL)', sub: 'Tablas: seg_, cat_, ord_, inv_, cli_', color: '#92400e', bg: '#fef3c7' },
];

layers.forEach((layer, i) => {
  doc.rect(M + 40, y, CW - 80, 34).fill(layer.bg).stroke(layer.color);
  doc.fontSize(10).fillColor(layer.color).font('Helvetica-Bold').text(layer.label, M + 50, y + 6, { width: CW - 100 });
  doc.fontSize(8).fillColor(DARK).font('Helvetica').text(layer.sub, M + 50, y + 18, { width: CW - 100 });
  if (i < layers.length - 1) {
    const ax = W / 2;
    doc.moveTo(ax, y + 34).lineTo(ax, y + 46).strokeColor(layer.color).lineWidth(1.5).stroke();
    doc.polygon([ax, y + 48], [ax - 5, y + 42], [ax + 5, y + 42]).fill(layer.color);
  }
  y += 50;
});

y += 10;
y = infoBox('Prefijos de tablas en la base de datos',
  'seg_ = Seguridad (usuarios, roles)  |  cat_ = Catálogo (productos, imágenes)  |  ord_ = Órdenes  |  inv_ = Inventario  |  cli_ = Clientes',
  y, '#fef9c3', '#92400e');

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 4 — INSTALACIÓN
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
y = 30;
y = sectionTitle('2. Instalación y Configuración Inicial', y);
y += 6;

y = subTitle('Requisitos previos', y);
y += 4;
['Node.js v18 o superior', 'PostgreSQL 14 o superior', 'npm o yarn'].forEach(req => {
  y = bullet(req, y, GREEN);
});
y += 10;

y = subTitle('Pasos de instalación', y);
y += 6;

y = codeBlock([
  '# 1. Clonar el repositorio',
  '$ git clone <url-del-repositorio>',
  '$ cd product-management',
  '',
  '# 2. Instalar dependencias del backend',
  '$ cd backend && npm install',
  '',
  '# 3. Instalar dependencias del frontend',
  '$ cd ../frontend && npm install',
], y);

y = subTitle('Variables de entorno (.env)', y);
y += 6;

y = codeBlock([
  '# backend/.env',
  'DB_HOST=localhost',
  'DB_PORT=5432',
  'DB_USER=postgres',
  'DB_PASSWORD=tu_password',
  'DB_NAME=product_management',
  'PORT=5001',
  'JWT_SECRET=clave-secreta-segura',
], y);

y = subTitle('Iniciar el sistema', y);
y += 6;

y = codeBlock([
  '# Terminal 1 — Backend',
  '$ cd backend && npm run dev',
  '  ✅ Database connected successfully',
  '  ✅ Database synchronized',
  '  🚀 Server running on port 5001',
  '',
  '# Terminal 2 — Frontend',
  '$ cd frontend && npm run dev',
  '  ➜  Local:   http://localhost:5173',
], y);

y += 6;
y = subTitle('Credenciales de acceso por defecto', y);
y += 6;

const credCols = [{ label: 'Rol', w: 120 }, { label: 'Email', w: 200 }, { label: 'Contraseña', w: CW - 320 }];
y = tableHeader(credCols, y);
y = tableRow(credCols, ['Administrador', 'admin@example.com', 'admin123'], y, false);
y = tableRow(credCols, ['Cliente', 'cliente@example.com', 'Cliente123!'], y, true);

y += 10;
y = infoBox('⚠ Importante', 'Cambia las contraseñas por defecto antes de desplegar en producción. Usa el script reset_pass.js para actualizar credenciales.', y, '#fef2f2', RED);

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 5 — PROCESO DE COMPRA: CATÁLOGO
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
y = 30;
y = sectionTitle('3. Proceso de Compra — Vista del Cliente', y);
y += 6;

y = subTitle('3.1 Catálogo y búsqueda de productos', y);
y += 4;

y = body('El cliente accede al catálogo en /catalogo. Los productos se muestran en grid con imagen, nombre, precio y badge de oferta. Puede filtrar por categoría, rango de precio y buscar por nombre.', y);
y += 8;

y = screenshotBox('Catálogo de productos — grid con imágenes, precios y badges', y, 140);

y = subTitle('Datos que muestra cada tarjeta de producto', y);
y += 4;

const cardData = [
  ['imagen_principal', 'URL de la imagen marcada como principal en cat_imagenes_producto'],
  ['nombre', 'Nombre del producto (cat_productos.nombre)'],
  ['precio_venta', 'Precio normal en soles'],
  ['precio_oferta', 'Precio con descuento (si existe, muestra badge OFERTA)'],
  ['stock_disponible', 'stock_fisico - stock_reservado. Si es 0, muestra badge AGOTADO'],
  ['sku', 'Código único del producto'],
];

const cardCols = [{ label: 'Campo', w: 140 }, { label: 'Descripción', w: CW - 140 }];
y = tableHeader(cardCols, y);
cardData.forEach(([campo, desc], i) => {
  y = tableRow(cardCols, [campo, desc], y, i % 2 === 0);
});

y += 12;
y = infoBox('Endpoint', 'GET /api/productos?page=1&limit=20&buscar=&categoria_id=  →  Devuelve productos con imagen_principal calculada desde imagenes[0]', y);

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 6 — VALIDACIÓN DE STOCK
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
y = 30;
y = sectionTitle('3.2 Validación de Stock en Tiempo Real', y);
y += 6;

y = body('El sistema valida el stock disponible en dos momentos críticos: al agregar al carrito y al confirmar la orden. Esto previene sobreventa incluso con múltiples usuarios comprando simultáneamente.', y);
y += 10;

y = subTitle('Flujo de validación', y);
y += 10;

// Diagrama de flujo de validación
const steps = [
  { n: '1', t: 'Cliente hace clic en\n"Agregar al carrito"' },
  { n: '2', t: 'Backend consulta\nstock_disponible' },
  { n: '3', t: '¿stock_fisico -\nstock_reservado ≥ cant?' },
  { n: '4a', t: '✅ Agrega al carrito\nReserva stock' },
  { n: '4b', t: '❌ Error 400\n"Stock insuficiente"' },
];

const stepW = 88;
const stepGap = 12;
const startX = M + 5;
const stepY = y;

// Paso 1, 2, 3 en línea
[0, 1, 2].forEach(i => {
  const active = i === 2;
  flowStep(steps[i].n, steps[i].t, startX + i * (stepW + stepGap), stepY, stepW, active);
  if (i < 2) {
    arrow(startX + (i + 1) * (stepW + stepGap) - stepGap, stepY + 16,
          startX + (i + 1) * (stepW + stepGap), stepY + 16);
  }
});

// Bifurcación desde paso 3
const bifX = startX + 2 * (stepW + stepGap) + stepW / 2;
const bifY = stepY + 32;

// Flecha hacia abajo izquierda (SÍ)
doc.moveTo(bifX - 30, bifY).lineTo(startX + 3 * (stepW + stepGap) + stepW/2 - 30, bifY + 20)
   .strokeColor('#16a34a').lineWidth(1.5).stroke();
doc.fontSize(7).fillColor(GREEN).font('Helvetica-Bold').text('SÍ', bifX - 55, bifY + 8);

// Flecha hacia abajo derecha (NO)
doc.moveTo(bifX + 30, bifY).lineTo(startX + 4 * (stepW + stepGap) + stepW/2 - 30, bifY + 20)
   .strokeColor(RED).lineWidth(1.5).stroke();
doc.fontSize(7).fillColor(RED).font('Helvetica-Bold').text('NO', bifX + 35, bifY + 8);

flowStep(steps[3].n, steps[3].t, startX + 3 * (stepW + stepGap), stepY + 54, stepW, false);
flowStep(steps[4].n, steps[4].t, startX + 4 * (stepW + stepGap), stepY + 54, stepW, false);

y = stepY + 100;

y = subTitle('Código de validación (carritoController.js)', y);
y += 4;

y = codeBlock([
  '// Al agregar al carrito:',
  'const stockDisponible = producto.stock',
  '  ? (producto.stock.stock_fisico - producto.stock.stock_reservado)',
  '  : 0;',
  'if (stockDisponible < cantidad)',
  '  return res.status(400).json({ message: "Stock insuficiente" });',
  '',
  '// Al crear la orden (doble validación):',
  'if (!prod.stock || prod.stock.stock_fisico',
  '    - prod.stock.stock_reservado < reqItem.cantidad)',
  '  return res.status(400).json({ message: `Stock insuficiente: ${prod.nombre}` });',
], y);

y = screenshotBox('Mensaje de error "Stock insuficiente" en el carrito / badge AGOTADO en la tarjeta', y, 90);

y = infoBox('¿Qué es stock_reservado?',
  'Cuando se crea una orden, el sistema incrementa stock_reservado para "apartar" las unidades. Al pagar (estado 2), se descuenta stock_fisico y se libera stock_reservado. Si se cancela (estado 6), solo se libera stock_reservado.',
  y, LBLUE, BLUE);

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 7 — CARRITO
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
y = 30;
y = sectionTitle('3.3 Carrito de Compras', y);
y += 6;

y = body('El carrito usa Zustand con persistencia en localStorage. Muestra imagen, nombre, precio y controles de cantidad. Desde el drawer lateral se puede ir al checkout rápido o ver el carrito completo.', y);
y += 8;

y = screenshotBox('CartDrawer abierto — productos con imagen, cantidad y subtotal', y, 130);

y = subTitle('Estructura del item en el carrito (cartStore.ts)', y);
y += 4;

y = codeBlock([
  'interface CartItem {',
  '  id: number;       // producto_id',
  '  nombre: string;',
  '  precio: number;   // precio_venta',
  '  cantidad: number;',
  '  imagen?: string;  // imagen_principal del producto',
  '}',
], y);

y += 6;
y = subTitle('Cálculo de totales en el checkout', y);
y += 6;

// Tabla de cálculo
const calcCols = [{ label: 'Concepto', w: 200 }, { label: 'Fórmula', w: CW - 200 }];
y = tableHeader(calcCols, y);
const calcs = [
  ['Subtotal (sin IGV)', 'Σ(precio_venta × cantidad) / 1.18'],
  ['IGV (18%)', 'total - subtotal_sin_igv'],
  ['Total', 'Σ(precio_venta × cantidad)'],
  ['Envío', 'Gratis (configurable)'],
];
calcs.forEach(([c, f], i) => { y = tableRow(calcCols, [c, f], y, i % 2 === 0); });

y += 12;
y = screenshotBox('Página de carrito completo con resumen de orden y botón Proceder al Pago', y, 120);

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 8 — PASARELA DE PAGO
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
y = 30;
y = sectionTitle('3.4 Pasarela de Pago — Yape / Plin / Tarjeta', y);
y += 6;

y = body('El checkout permite seleccionar el método de pago. Para Yape y Plin se muestra el QR correspondiente. El cliente ingresa la referencia de pago y confirma la orden.', y);
y += 8;

y = screenshotBox('Pantalla de checkout — selección de método de pago con QR de Yape/Plin', y, 150);

y = subTitle('Métodos de pago disponibles', y);
y += 6;

const payMethods = [
  ['Yape', 'Muestra QR desde /public/qr_yape.png. Cliente escanea y paga.', 'metodo_pago: "yape"'],
  ['Plin', 'Muestra QR desde /public/qr_plin.png. Cliente escanea y paga.', 'metodo_pago: "plin"'],
  ['Tarjeta', 'Formulario de datos de tarjeta (integración futura con pasarela).', 'metodo_pago: "tarjeta"'],
  ['Efectivo', 'Pago contra entrega. La orden queda en estado Pendiente.', 'metodo_pago: "efectivo"'],
];

const payCols = [{ label: 'Método', w: 70 }, { label: 'Descripción', w: 250 }, { label: 'Valor en BD', w: CW - 320 }];
y = tableHeader(payCols, y);
payMethods.forEach(([m, d, v], i) => { y = tableRow(payCols, [m, d, v], y, i % 2 === 0); });

y += 10;
y = subTitle('Flujo de creación de orden (POST /api/ordenes)', y);
y += 6;

y = codeBlock([
  '// Payload enviado al backend:',
  '{',
  '  items: [{ producto_id: 5, cantidad: 2 }],',
  '  metodo_pago: "yape",',
  '  pago_referencia: "OP-123456",',
  '  direccion_obj: {',
  '    direccion_linea1: "Av. Lima 123",',
  '    ciudad: "Lima",',
  '    departamento: "Lima"',
  '  }',
  '}',
], y);

y += 4;
y = infoBox('Proceso interno al crear la orden',
  '1. Valida stock de cada producto  →  2. Crea dirección de envío  →  3. Crea registro en ord_ordenes (estado=1 Pendiente)  →  4. Crea items en ord_items_orden  →  5. Incrementa stock_reservado  →  6. Registra en historial de estados',
  y, '#f0fdf4', GREEN);

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 9 — TICKET Y MIS ÓRDENES
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
y = 30;
y = sectionTitle('3.5 Confirmación y Ticket de Compra', y);
y += 6;

y = body('Tras completar el pago, el cliente puede ver sus órdenes en "Mis Órdenes". Al hacer clic en "Ver detalle" se abre un modal con el desglose completo y el botón para descargar el ticket PDF.', y);
y += 8;

y = screenshotBox('Página Mis Órdenes — tabla con código, fecha, total y estado', y, 110);

y = screenshotBox('Modal de detalle de orden — productos, subtotal, IGV, total y botón Descargar Ticket', y, 130);

y = subTitle('Estructura del ticket PDF (80mm)', y);
y += 6;

// Simulación visual del ticket
const tW = 160;
const tX = W/2 - tW/2;
let tY = y;

doc.rect(tX, tY, tW, 260).fill('#fafafa').stroke('#e2e8f0');
// Header azul
doc.rect(tX, tY, tW, 40).fill(BLUE);
doc.fontSize(11).fillColor(WHITE).font('Helvetica-Bold').text('StockMaster', tX, tY + 6, { width: tW, align: 'center' });
doc.fontSize(7).fillColor('#bfdbfe').font('Helvetica').text('COMPROBANTE DE VENTA', tX, tY + 20, { width: tW, align: 'center' });
doc.fontSize(6.5).fillColor('#bfdbfe').text('RUC: 20123456789', tX, tY + 30, { width: tW, align: 'center' });
tY += 44;
doc.fontSize(8).fillColor(BLUE).font('Helvetica-Bold').text('ORD-1777754632162', tX, tY, { width: tW, align: 'center' }); tY += 11;
doc.fontSize(7).fillColor(GRAY).font('Helvetica').text('02/05/2025  14:32', tX, tY, { width: tW, align: 'center' }); tY += 10;
doc.moveTo(tX + 8, tY).lineTo(tX + tW - 8, tY).dash(2, {space:2}).strokeColor('#d1d5db').lineWidth(0.5).stroke().undash(); tY += 7;
doc.fontSize(7).fillColor(DARK).font('Helvetica-Bold').text('CLIENTE', tX + 8, tY); tY += 10;
doc.fontSize(7).fillColor(DARK).font('Helvetica').text('Juan Pérez', tX + 8, tY); tY += 9;
doc.fontSize(6.5).fillColor(GRAY).text('cliente@example.com', tX + 8, tY); tY += 9;
doc.moveTo(tX + 8, tY).lineTo(tX + tW - 8, tY).dash(2, {space:2}).strokeColor('#d1d5db').lineWidth(0.5).stroke().undash(); tY += 7;
doc.fontSize(7).fillColor(DARK).font('Helvetica-Bold').text('PRODUCTO', tX + 8, tY);
doc.text('CANT', tX + 90, tY); doc.text('TOTAL', tX + 120, tY); tY += 10;
doc.moveTo(tX + 8, tY).lineTo(tX + tW - 8, tY).dash(2, {space:2}).strokeColor('#d1d5db').lineWidth(0.5).stroke().undash(); tY += 6;
doc.fontSize(7).fillColor(DARK).font('Helvetica').text('Monitor 4K 32"', tX + 8, tY, {width: 80});
doc.text('1', tX + 90, tY); doc.text('450.00', tX + 115, tY); tY += 13;
doc.moveTo(tX + 8, tY).lineTo(tX + tW - 8, tY).dash(2, {space:2}).strokeColor('#d1d5db').lineWidth(0.5).stroke().undash(); tY += 7;
doc.fontSize(7).fillColor(DARK).font('Helvetica').text('Subtotal:', tX + 8, tY); doc.text('S/. 381.36', tX + 100, tY); tY += 10;
doc.text('IGV (18%):', tX + 8, tY); doc.text('S/. 68.64', tX + 100, tY); tY += 10;
doc.moveTo(tX + 8, tY).lineTo(tX + tW - 8, tY).dash(2, {space:2}).strokeColor('#d1d5db').lineWidth(0.5).stroke().undash(); tY += 6;
doc.fontSize(8.5).fillColor(BLUE).font('Helvetica-Bold').text('TOTAL:', tX + 8, tY); doc.text('S/. 450.00', tX + 95, tY); tY += 14;
doc.rect(tX + 8, tY, tW - 16, 18).fill(GREEN);
doc.fontSize(8).fillColor(WHITE).font('Helvetica-Bold').text('Estado: PAGADA', tX + 8, tY + 5, { width: tW - 16, align: 'center' }); tY += 24;
doc.fontSize(6.5).fillColor(GRAY).font('Helvetica').text('¡Gracias por tu compra!', tX, tY, { width: tW, align: 'center' });

y = tY + 20;
y = infoBox('Endpoint del ticket', 'GET /api/ordenes/:id/ticket  →  Devuelve PDF binario (application/pdf). Disponible para el cliente dueño de la orden y para administradores.', y);

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 10 — PANEL ADMIN: DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
y = 30;
y = sectionTitle('4. Panel de Administración', y);
y += 4;
y = subTitle('4.1 Dashboard y KPIs', y);
y += 6;

y = body('El dashboard muestra métricas en tiempo real: ventas del día, órdenes pendientes, productos con stock crítico y top productos. Los datos se actualizan al recargar la página.', y);
y += 10;

// KPI boxes simulados
const kpis = [
  { label: 'Ventas hoy', value: 'S/. 2,450', color: GREEN },
  { label: 'Órdenes pendientes', value: '7', color: YELLOW },
  { label: 'Stock crítico', value: '3 prods.', color: RED },
  { label: 'Clientes activos', value: '24', color: BLUE },
];
const kW = (CW - 18) / 4;
kpis.forEach((k, i) => { kpiBox(k.label, k.value, M + i * (kW + 6), y, kW, k.color); });
y += 66;

y = screenshotBox('Dashboard — KPIs, gráfico de ventas diarias y top productos', y, 150);

y = subTitle('Endpoints del dashboard', y);
y += 4;

const dashEndpoints = [
  ['GET /api/dashboard/kpis', 'Ventas totales, órdenes por estado, productos críticos'],
  ['GET /api/dashboard/ventas-diarias', 'Ventas de los últimos N días (param: dias=30)'],
  ['GET /api/dashboard/ventas-categoria', 'Ingresos agrupados por categoría de producto'],
  ['GET /api/dashboard/top-productos', 'Top 5 productos más vendidos'],
];

const dCols = [{ label: 'Endpoint', w: 220 }, { label: 'Descripción', w: CW - 220 }];
y = tableHeader(dCols, y);
dashEndpoints.forEach(([ep, desc], i) => { y = tableRow(dCols, [ep, desc], y, i % 2 === 0); });

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 11 — GESTIÓN DE PRODUCTOS
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
y = 30;
y = sectionTitle('4.2 Gestión de Productos e Imágenes', y);
y += 6;

y = body('El administrador puede crear, editar, desactivar y exportar productos. Al editar un producto existente, aparece la sección de imágenes donde puede subir fotos (JPG/PNG/WebP, máx. 5MB).', y);
y += 8;

y = screenshotBox('Lista de productos con SKU, nombre, categoría, precio, stock y acciones', y, 110);

y = screenshotBox('Modal de edición — formulario de datos + sección de imágenes con grid de fotos', y, 130);

y = subTitle('Flujo de subida de imágenes', y);
y += 6;

const imgSteps = [
  ['1', 'Admin abre modal de edición de un producto existente'],
  ['2', 'Hace clic en "Subir imagen" o en el área punteada'],
  ['3', 'Selecciona archivo (JPG/PNG/WebP, máx. 5MB)'],
  ['4', 'POST /api/productos/:id/imagen (multipart/form-data)'],
  ['5', 'Multer guarda el archivo en backend/uploads/productos/'],
  ['6', 'Se crea registro en cat_imagenes_producto con la URL pública'],
  ['7', 'La primera imagen se marca automáticamente como principal (⭐)'],
];

const iCols = [{ label: '#', w: 25 }, { label: 'Paso', w: CW - 25 }];
y = tableHeader(iCols, y);
imgSteps.forEach(([n, paso], i) => { y = tableRow(iCols, [n, paso], y, i % 2 === 0); });

y += 8;
y = infoBox('URL de imágenes', 'Las imágenes se sirven desde: http://localhost:5001/uploads/productos/prod_{id}_{timestamp}.{ext}  —  Configurable en producción con CDN o S3.', y);

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 12 — DETALLE DE ÓRDENES
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
y = 30;
y = sectionTitle('4.3 Detalle de Órdenes', y);
y += 6;

y = body('El admin ve todas las órdenes del sistema. Al hacer clic en el ícono de ojo, se carga el detalle completo con los productos, cliente, y el selector de estado. También puede descargar el ticket PDF.', y);
y += 8;

y = screenshotBox('Tabla de órdenes — código, cliente, total, estado, fecha y acciones', y, 110);

y = screenshotBox('Modal de detalle — cliente, productos con cantidades, totales y cambio de estado', y, 140);

y = subTitle('Estados de una orden', y);
y += 6;

const estados = [
  ['1', 'Pendiente', 'Orden creada, esperando pago', YELLOW],
  ['2', 'Pagada', 'Pago confirmado. Stock físico descontado automáticamente.', GREEN],
  ['3', 'En Proceso', 'Preparando el pedido para envío', BLUE],
  ['4', 'Enviada', 'Pedido en camino al cliente', '#4f46e5'],
  ['5', 'Entregada', 'Cliente recibió el pedido', '#065f46'],
  ['6', 'Cancelada', 'Orden cancelada. Stock reservado liberado.', RED],
  ['7', 'Devuelta', 'Cliente devolvió el pedido', GRAY],
];

const eCols = [
  { label: 'ID', w: 30 },
  { label: 'Estado', w: 90 },
  { label: 'Descripción', w: CW - 120 },
];
y = tableHeader(eCols, y);
estados.forEach(([id, nombre, desc, color], i) => {
  const rowY = y;
  doc.rect(M, rowY, CW, 18).fill(i % 2 === 0 ? BGLIGHT : WHITE);
  doc.fontSize(8).fillColor(DARK).font('Helvetica').text(id, M + 4, rowY + 5, { width: 26 });
  doc.roundedRect(M + 34, rowY + 3, 80, 12, 3).fill(color + '22');
  doc.fontSize(7.5).fillColor(color).font('Helvetica-Bold').text(nombre, M + 38, rowY + 5, { width: 76 });
  doc.fontSize(8).fillColor(DARK).font('Helvetica').text(desc, M + 124, rowY + 5, { width: CW - 128, ellipsis: true });
  y += 18;
});

y += 10;
y = infoBox('Impacto en stock al cambiar estado',
  'Estado 2 (Pagada): stock_fisico -= cantidad, stock_reservado -= cantidad  |  Estado 6 (Cancelada): stock_reservado -= cantidad  |  Estado 5 (Entregada sin pago previo): igual que estado 2',
  y, '#f0fdf4', GREEN);

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 13 — INVENTARIO Y AJUSTES
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
y = 30;
y = sectionTitle('4.4 Control de Inventario y Ajustes', y);
y += 6;

y = body('La vista de inventario muestra stock físico, reservado y disponible por producto. Los productos con stock disponible ≤ stock_mínimo se resaltan en rojo con un ícono de alerta. El admin puede hacer ajustes manuales de entrada o salida.', y);
y += 8;

y = screenshotBox('Tabla de inventario — SKU, producto, físico, reservado, disponible (en rojo si crítico), mínimo', y, 120);

y = subTitle('Columnas de la tabla de inventario', y);
y += 4;

const invCols2 = [{ label: 'Columna', w: 120 }, { label: 'Fuente en BD', w: 160 }, { label: 'Descripción', w: CW - 280 }];
y = tableHeader(invCols2, y);
const invRows = [
  ['Físico', 'inv_stock_producto.stock_fisico', 'Unidades reales en almacén'],
  ['Reservado', 'inv_stock_producto.stock_reservado', 'Apartadas por órdenes pendientes'],
  ['Disponible', 'stock_fisico - stock_reservado', 'Lo que se puede vender ahora'],
  ['Mínimo', 'cat_productos.stock_minimo', 'Umbral de alerta de reposición'],
];
invRows.forEach(([c, f, d], i) => { y = tableRow(invCols2, [c, f, d], y, i % 2 === 0); });

y += 10;
y = screenshotBox('Modal de ajuste — tipo Entrada/Salida, cantidad y motivo obligatorio', y, 120);

y = subTitle('Proceso de ajuste manual', y);
y += 6;

y = codeBlock([
  '// POST /api/inventario/ajuste',
  '{',
  '  "producto_id": 5,',
  '  "tipo": "entrada",   // o "salida"',
  '  "cantidad": 10,',
  '  "motivo": "Reposición de proveedor"',
  '}',
  '// Resultado: stock_fisico += 10',
  '// Registra en inv_movimientos_inventario',
], y);

y = infoBox('Validación de ajuste de salida',
  'Si tipo="salida" y cantidad > stock_fisico actual, el backend retorna error 400 "Stock insuficiente". Esto previene que el stock quede negativo.',
  y, '#fef2f2', RED);

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 14 — REPORTES PDF
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
y = 30;
y = sectionTitle('4.5 Reportes PDF — Inventario en Rojo', y);
y += 6;

y = body('El Centro de Reportes genera PDFs descargables para auditoría y toma de decisiones. Los reportes de inventario resaltan en rojo los productos con stock crítico. Se puede filtrar por rango de fechas.', y);
y += 8;

y = screenshotBox('Centro de Reportes — grid de reportes operacionales y de gestión (BI)', y, 120);

y = subTitle('Reportes disponibles', y);
y += 4;

const reportes = [
  ['Listado de Órdenes', '/api/reportes/ordenes', 'Todas las órdenes activas con cliente, estado y total'],
  ['Inventario Valorizado', '/api/reportes/inventario', 'Stock por producto. Filas en ROJO = stock crítico'],
  ['Stock Crítico', '/api/reportes/stock_bajo', 'Solo productos agotados o bajo el mínimo'],
  ['Movimientos Kardex', '/api/reportes/movimientos', 'Entradas, salidas y ajustes de inventario'],
  ['Clientes', '/api/reportes/clientes', 'Listado de clientes con estado y fecha de registro'],
  ['Rentabilidad', '/api/reportes/rentabilidad', 'Costo vs. venta y margen bruto por producto'],
  ['Ventas por Categoría', '/api/reportes/ventas_cat', 'Ingresos y % del total por línea de producto'],
];

const rCols = [{ label: 'Reporte', w: 140 }, { label: 'Endpoint', w: 170 }, { label: 'Contenido', w: CW - 310 }];
y = tableHeader(rCols, y);
reportes.forEach(([nombre, ep, desc], i) => { y = tableRow(rCols, [nombre, ep, desc], y, i % 2 === 0); });

y += 10;

// Simulación visual del reporte de inventario con filas rojas
y = subTitle('Vista previa — Reporte de Inventario (filas rojas = stock crítico)', y);
y += 6;

const simCols = [
  { label: 'SKU', w: 80 },
  { label: 'Producto', w: 140 },
  { label: 'Físico', w: 50, align: 'center' },
  { label: 'Disponible', w: 60, align: 'center' },
  { label: 'Estado', w: CW - 330 },
];
y = tableHeader(simCols, y);

const simRows = [
  ['ADV-ELE-001', 'MacBook Pro M2', '0', '0', 'AGOTADO'],
  ['ADV-ELE-002', 'iPhone 15 Pro', '4', '2', 'BAJO'],
  ['ADV-OFI-001', 'Monitor 4K 32"', '6', '6', 'OK'],
  ['ADV-ROP-001', 'Zapatillas Running', '25', '25', 'OK'],
];

simRows.forEach(([sku, nombre, fis, disp, estado], i) => {
  const isCritical = estado !== 'OK';
  const rowY = y;
  doc.rect(M, rowY, CW, 18).fill(isCritical ? '#fef2f2' : (i % 2 === 0 ? BGLIGHT : WHITE));
  if (isCritical) doc.rect(M, rowY, 3, 18).fill(RED);
  const vals = [sku, nombre, fis, disp, estado];
  let x = M;
  simCols.forEach((col, ci) => {
    const color = ci === 4 ? (estado === 'AGOTADO' ? RED : YELLOW) : DARK;
    const font = (ci === 4 || isCritical) ? 'Helvetica-Bold' : 'Helvetica';
    doc.fontSize(8).fillColor(color).font(font)
       .text(vals[ci], x + 4, rowY + 5, { width: col.w - 8, align: col.align || 'left' });
    x += col.w;
  });
  y += 18;
});

y += 10;
y = infoBox('¿Cómo se determina el color rojo?',
  'disponible = stock_fisico - stock_reservado  |  Si disponible ≤ stock_minimo → fila roja en el reporte  |  Si stock_fisico = 0 → estado "AGOTADO"  |  Si 0 < disponible ≤ stock_minimo → estado "BAJO"',
  y, '#fef2f2', RED);

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 15 — FLUJO COMPLETO DE UNA ORDEN
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
y = 30;
y = sectionTitle('5. Flujo Completo de una Orden', y);
y += 6;

y = body('Este diagrama muestra el ciclo de vida completo de una orden, desde que el cliente agrega un producto al carrito hasta que el administrador la marca como entregada y el stock se actualiza.', y);
y += 14;

// Diagrama de flujo completo
const fullFlow = [
  { n: '1', t: 'Cliente agrega\nal carrito', color: BLUE },
  { n: '2', t: 'Valida stock\ndisponible', color: BLUE },
  { n: '3', t: 'Checkout:\nselecciona pago', color: BLUE },
  { n: '4', t: 'POST /ordenes\nEstado: Pendiente', color: YELLOW },
  { n: '5', t: 'Admin confirma\npago recibido', color: GREEN },
  { n: '6', t: 'Estado: Pagada\nStock descontado', color: GREEN },
  { n: '7', t: 'Preparación\ny envío', color: '#4f46e5' },
  { n: '8', t: 'Estado: Entregada\nCiclo completo', color: '#065f46' },
];

const fW = 56;
const fGap = 8;
const fY = y;
const totalW = fullFlow.length * (fW + fGap) - fGap;
const fStartX = M + (CW - totalW) / 2;

fullFlow.forEach((step, i) => {
  const x = fStartX + i * (fW + fGap);
  doc.rect(x, fY, fW, 38).fill(step.color + '22').stroke(step.color);
  doc.rect(x, fY, fW, 6).fill(step.color);
  doc.fontSize(7).fillColor(WHITE).font('Helvetica-Bold').text(step.n, x + 2, fY + 1, { width: fW - 4, align: 'center' });
  doc.fontSize(7).fillColor(DARK).font('Helvetica').text(step.t, x + 3, fY + 10, { width: fW - 6, lineGap: 1 });
  if (i < fullFlow.length - 1) {
    const ax = x + fW;
    const ay = fY + 19;
    doc.moveTo(ax, ay).lineTo(ax + fGap - 2, ay).strokeColor(step.color).lineWidth(1.5).stroke();
    doc.polygon([ax + fGap, ay], [ax + fGap - 4, ay - 3], [ax + fGap - 4, ay + 3]).fill(step.color);
  }
});

y = fY + 56;

// Tabla de impacto en BD por cada paso
y = subTitle('Impacto en base de datos por paso', y);
y += 6;

const impactCols = [{ label: 'Paso', w: 40 }, { label: 'Acción', w: 130 }, { label: 'Tabla afectada', w: 130 }, { label: 'Cambio', w: CW - 300 }];
y = tableHeader(impactCols, y);
const impacts = [
  ['4', 'Crear orden', 'ord_ordenes', 'estado_id = 1'],
  ['4', 'Crear items', 'ord_items_orden', 'INSERT por cada producto'],
  ['4', 'Reservar stock', 'inv_stock_producto', 'stock_reservado += cantidad'],
  ['4', 'Historial', 'ord_historial_estados', 'INSERT estado 1'],
  ['6', 'Pago confirmado', 'ord_ordenes', 'estado_id = 2'],
  ['6', 'Descontar stock', 'inv_stock_producto', 'stock_fisico -= cantidad'],
  ['6', 'Liberar reserva', 'inv_stock_producto', 'stock_reservado -= cantidad'],
  ['8', 'Entregada', 'ord_ordenes', 'estado_id = 5'],
];
impacts.forEach(([paso, accion, tabla, cambio], i) => {
  y = tableRow(impactCols, [paso, accion, tabla, cambio], y, i % 2 === 0);
});

y += 10;
y = screenshotBox('Vista del historial de estados en el detalle de orden del admin', y, 90);

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 16 — REFERENCIA DE API
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
y = 30;
y = sectionTitle('6. Referencia de API', y);
y += 6;

y = body('Todos los endpoints del backend. Base URL: http://localhost:5001/api  |  Autenticación: Bearer Token en header Authorization (excepto GET /productos y GET /auth/login).', y);
y += 10;

const apiGroups = [
  {
    group: 'Autenticación',
    endpoints: [
      ['POST', '/auth/login', 'Público', 'Login. Retorna accessToken y refreshToken'],
      ['POST', '/auth/register', 'Público', 'Registro de nuevo cliente'],
      ['POST', '/auth/logout', 'Auth', 'Invalida el refreshToken'],
      ['POST', '/auth/refresh-token', 'Público', 'Renueva el accessToken'],
    ]
  },
  {
    group: 'Productos',
    endpoints: [
      ['GET', '/productos', 'Público', 'Lista productos con imagen_principal y stock'],
      ['GET', '/productos/:id', 'Público', 'Detalle de producto con todas las imágenes'],
      ['POST', '/productos', 'Admin', 'Crear producto (crea StockProducto automáticamente)'],
      ['PUT', '/productos/:id', 'Admin', 'Actualizar datos del producto'],
      ['POST', '/productos/:id/imagen', 'Admin', 'Subir imagen (multipart/form-data)'],
      ['DELETE', '/productos/:id/imagen/:imgId', 'Admin', 'Eliminar imagen del producto'],
    ]
  },
  {
    group: 'Órdenes',
    endpoints: [
      ['POST', '/ordenes', 'Auth', 'Crear orden (valida stock, reserva unidades)'],
      ['GET', '/ordenes/mis-ordenes', 'Auth', 'Órdenes del cliente autenticado'],
      ['GET', '/ordenes', 'Admin', 'Todas las órdenes del sistema'],
      ['GET', '/ordenes/:id', 'Auth', 'Detalle con items, cliente e historial'],
      ['GET', '/ordenes/:id/ticket', 'Auth', 'Genera y descarga ticket PDF'],
      ['PATCH', '/ordenes/:id/estado', 'Admin', 'Cambiar estado (actualiza stock automáticamente)'],
    ]
  },
  {
    group: 'Inventario',
    endpoints: [
      ['GET', '/inventario/stock', 'Auth', 'Stock de todos los productos activos'],
      ['POST', '/inventario/ajuste', 'Admin', 'Ajuste manual de stock (entrada/salida)'],
      ['GET', '/inventario/movimientos', 'Auth', 'Historial de movimientos de inventario'],
    ]
  },
  {
    group: 'Reportes',
    endpoints: [
      ['GET', '/reportes/ordenes', 'Admin', 'PDF — Listado de órdenes'],
      ['GET', '/reportes/inventario', 'Admin', 'PDF — Inventario valorizado (filas rojas = crítico)'],
      ['GET', '/reportes/stock_bajo', 'Admin', 'PDF — Solo productos críticos'],
      ['GET', '/reportes/rentabilidad', 'Admin', 'PDF — Análisis de margen por producto'],
    ]
  },
];

const apiCols = [
  { label: 'Método', w: 45 },
  { label: 'Ruta', w: 175 },
  { label: 'Auth', w: 55 },
  { label: 'Descripción', w: CW - 275 },
];

apiGroups.forEach(group => {
  if (y > 700) { newPage(); y = 30; }
  y = subTitle(group.group, y);
  y += 4;
  y = tableHeader(apiCols, y);
  group.endpoints.forEach(([method, route, auth, desc], i) => {
    const mColor = method === 'GET' ? GREEN : method === 'POST' ? BLUE : method === 'PUT' ? YELLOW : RED;
    const rowY = y;
    doc.rect(M, rowY, CW, 18).fill(i % 2 === 0 ? BGLIGHT : WHITE);
    doc.roundedRect(M + 3, rowY + 3, 38, 12, 2).fill(mColor + '22');
    doc.fontSize(7.5).fillColor(mColor).font('Helvetica-Bold').text(method, M + 5, rowY + 5, { width: 36, align: 'center' });
    doc.fontSize(8).fillColor(DARK).font('Helvetica').text(route, M + 49, rowY + 5, { width: 171 });
    const authColor = auth === 'Público' ? GREEN : auth === 'Admin' ? RED : BLUE;
    doc.fontSize(7).fillColor(authColor).font('Helvetica-Bold').text(auth, M + 224, rowY + 5, { width: 51 });
    doc.fontSize(8).fillColor(DARK).font('Helvetica').text(desc, M + 279, rowY + 5, { width: CW - 283, ellipsis: true });
    y += 18;
  });
  y += 8;
});

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA FINAL — NOTAS Y CIERRE
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
y = 30;
y = sectionTitle('Notas Finales y Próximas Funcionalidades', y);
y += 10;

y = subTitle('Funcionalidades implementadas ✅', y);
y += 4;
const done = [
  'Catálogo de productos con imágenes, precios y stock en tiempo real',
  'Carrito de compras con persistencia en localStorage',
  'Proceso de checkout con selección de método de pago (Yape/Plin/Tarjeta)',
  'Validación de stock en dos capas (carrito y creación de orden)',
  'Panel de administración completo (productos, órdenes, inventario, clientes)',
  'Gestión de imágenes de productos con subida de archivos (Multer)',
  'Control de inventario con ajustes manuales y registro de movimientos',
  'Cambio de estado de órdenes con actualización automática de stock',
  'Generación de tickets PDF (80mm) para clientes y administradores',
  'Centro de reportes con 13 tipos de PDF descargables',
  'Reportes con filas rojas para productos con stock crítico',
  'Autenticación JWT con refresh token automático',
];
done.forEach(item => { y = bullet(item, y, GREEN); });

y += 10;
y = subTitle('Funcionalidades en desarrollo 🔧', y);
y += 4;
const pending = [
  'Integración con pasarela de pago real (Culqi, Mercado Pago)',
  'Módulo de devoluciones y reembolsos',
  'Notificaciones por email al cambiar estado de orden',
  'Módulo de proveedores y órdenes de compra',
  'Reportes de rotación de inventario y segmentación de clientes',
  'Panel de estadísticas avanzadas (BI)',
];
pending.forEach(item => { y = bullet(item, y, YELLOW); });

y += 16;

// Caja de contacto/soporte
doc.rect(M, y, CW, 70).fill(BLUE);
doc.fontSize(14).fillColor(WHITE).font('Helvetica-Bold')
   .text('StockMaster', M, y + 12, { width: CW, align: 'center' });
doc.fontSize(9).fillColor('#bfdbfe').font('Helvetica')
   .text('Sistema de Gestión de Inventario y E-Commerce', M, y + 30, { width: CW, align: 'center' });
doc.fontSize(8).fillColor('#93c5fd')
   .text('soporte@stockmaster.pe  |  www.stockmaster.pe  |  v1.0 — 2025', M, y + 46, { width: CW, align: 'center' });

// ─── Finalizar PDF ────────────────────────────────────────────────────────────
doc.end();
out.on('finish', () => {
  console.log('✅ Manual generado: backend/manual_stockmaster.pdf');
  console.log(`   Páginas: ${pageNum}`);
  const size = fs.statSync(path.join(__dirname, 'manual_stockmaster.pdf')).size;
  console.log(`   Tamaño: ${(size / 1024).toFixed(1)} KB`);
  process.exit(0);
});
out.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
