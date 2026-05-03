const { Cliente, Direccion, Orden, EstadoOrden, Usuario } = require('../models'); 
const { Op } = require('sequelize'); 

const clienteController = { 
  async listar(req, res) { 
    try { 
      const { page = 1, limit = 20, buscar } = req.query; 
      const where = {}; 
      
      const usuarioInclude = { 
        model: Usuario, 
        as: 'usuario', 
        attributes: ['nombre', 'apellido', 'email'],
        required: !!buscar, // INNER JOIN solo cuando hay búsqueda, LEFT JOIN por defecto
      };

      if (buscar) {
        usuarioInclude.where = {
          [Op.or]: [
            { nombre: { [Op.iLike]: `%${buscar}%` } }, 
            { apellido: { [Op.iLike]: `%${buscar}%` } }, 
            { email: { [Op.iLike]: `%${buscar}%` } } 
          ]
        };
      }

      const include = [usuarioInclude];

      const { count, rows } = await Cliente.findAndCountAll({ 
        where, 
        limit: parseInt(limit), 
        offset: (page - 1) * limit, 
        include,
        order: [['created_at', 'DESC']] 
      }); 
      
      console.log(`LISTAR CLIENTES: Se encontraron ${rows.length} registros.`);
      if (rows.length > 0) {
        console.log('Primer cliente con usuario:', JSON.stringify({
          id: rows[0].id,
          usuario: rows[0].usuario ? 'Presente' : 'AUSENTE'
        }));
      }

      res.json({ success: true, data: rows, total: count }); 
    } catch (error) { 
      console.error("LISTAR CLIENTES ERROR:", error);
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async obtener(req, res) { 
    try { 
      const cliente = await Cliente.findByPk(req.params.id, { 
        include: [ 
          { model: Direccion, as: 'direcciones' }, 
          { model: Orden, as: 'ordenes', 
            include: [{ model: EstadoOrden, as: 'estado' }], 
            order: [['created_at', 'DESC']], limit: 10 
          } 
        ] 
      }); 
      if (!cliente) return res.status(404).json({ success: false, message: 'Cliente no encontrado' }); 
      res.json({ success: true, data: cliente }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async actualizar(req, res) { 
    try { 
      const cliente = await Cliente.findByPk(req.params.id); 
      if (!cliente) return res.status(404).json({ success: false, message: 'Cliente no encontrado' }); 
      await cliente.update(req.body); 
      res.json({ success: true, data: cliente }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  }, 

  async agregarDireccion(req, res) { 
    try { 
      const direccion = await Direccion.create({ 
        ...req.body, cliente_id: req.params.id 
      }); 
      res.status(201).json({ success: true, data: direccion }); 
    } catch (error) { 
      res.status(500).json({ success: false, message: error.message }); 
    } 
  } 
}; 

module.exports = clienteController; 
