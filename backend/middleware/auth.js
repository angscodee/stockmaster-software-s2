const jwt = require('jsonwebtoken'); 

const verifyToken = (req, res, next) => { 
  const authHeader = req.headers['authorization']; 
  const token = authHeader && authHeader.split(' ')[1]; 
  if (!token) return res.status(401).json({ success: false, message: 'Token requerido' }); 
  try { 
    req.user = jwt.verify(token, process.env.JWT_SECRET); 
    next(); 
  } catch { 
    res.status(401).json({ success: false, message: 'Token inválido o expirado' }); 
  } 
}; 

const requireRole = (...roles) => (req, res, next) => { 
  if (!roles.includes(req.user?.role)) { 
    return res.status(403).json({ success: false, message: 'Permisos insuficientes' }); 
  } 
  next(); 
}; 

module.exports = { verifyToken, requireRole }; 
