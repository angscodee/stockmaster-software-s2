const express = require('express'); 
const cors = require('cors'); 
const path = require('path');
require('dotenv').config(); 
const { sequelize, testConnection } = require('./config/database'); 

// Rutas 
const authRoutes = require('./routes/auth'); 
const productRoutes = require('./routes/products'); 
const reportRoutes = require('./routes/reports'); 
const carritoRoutes = require('./routes/carrito'); 
const ordenRoutes = require('./routes/ordenes'); 
const clienteRoutes = require('./routes/clientes'); 
const inventarioRoutes = require('./routes/inventario'); 
const dashboardRoutes = require('./routes/dashboard'); 

const app = express(); 
const PORT = process.env.PORT || 5001; 

// CORS — permite el frontend en producción y en local
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://stockmaster-software-s2-q4i4.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl) y los orígenes permitidos
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado para: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

app.use('/api/auth', authRoutes); 
app.use('/api/productos', productRoutes); 
app.use('/api/reportes', reportRoutes); 
app.use('/api/carrito', carritoRoutes); 
app.use('/api/ordenes', ordenRoutes); 
app.use('/api/clientes', clienteRoutes); 
app.use('/api/inventario', inventarioRoutes); 
app.use('/api/dashboard', dashboardRoutes); 

app.use((err, req, res, next) => { 
  console.error(err.stack); 
  res.status(500).json({ success: false, message: err.message || 'Error interno' }); 
}); 

const startServer = async () => { 
  try { 
    await testConnection(); 
    await sequelize.sync({ force: false }); 
    console.log('✅ Database synchronized'); 
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)); 
  } catch (error) { 
    console.error('❌ Failed to start server:', error); 
  } 
}; 

startServer(); 
