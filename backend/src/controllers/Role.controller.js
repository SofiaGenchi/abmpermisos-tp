import Role from '../models/Role.model.js';
import Permission from '../models/Permission.model.js'

//para listar todos los roles
export const getRoles = async (req, res) => {
    try {
        const roles = await Role.find().populate('permissions');
        return res.json(roles);
    } catch (error) {
        console.log('Error al listar roles:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const getRoleById = async (req, res) => {
    try {
        const role = await Role.findById(req.params.roleId).populate('permissions');

        if(!role) return res.status(404).json({ message: 'Rol no encontrado' });
        return res.json(role);
    }catch(error){
        console.log('Error al obtener rol:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// codigo para crear rol, recibe nombre, descripcion, permiso
export const createRole = async (req, res) => {
    try {
        const { name, description, permissions = [] } = req.body;

        if(!name) return res.status(400).json({ message: 'EL campo "name" es obligatorio.' });

        //para ver si los permisos existen
        if(permissions.length) {
            // 🟢 CORRECCIÓN 1: Cambiado $sin por $in para la consulta
            const found = await Permission.find({_id: { $in: permissions }});
            if(found.length !== permissions.length){
                return res.status(400).json({ message: 'Alguno de los permisos enviados no existe' });
            }
        }

        const newRole = new Role({ name, description, permissions });
        await newRole.save();
        const populated = await newRole.populate('permissions');
        return res.status(201).json(populated);
    }catch (error) {
        console.log('Error al crear rol:', error);
        
        // 🟢 CORRECCIÓN 2: Capturar CastError (ID mal formado)
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'Error: Uno o más IDs de permiso no son válidos.' });
        }
        
        if(error.code === 11000){
            return res.status(400).json({ message: 'El nombre del rol ya existe' });
        }
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const updateRole = async (req, res) => {
  try {
    const { permissions } = req.body;
    if (permissions && permissions.length) {
      // ⚠️ NOTA: El operador $in es correcto aquí.
      const found = await Permission.find({ _id: { $in: permissions } });
      if (found.length !== permissions.length) {
        return res.status(400).json({ message: 'Alguno de los permisos enviados no existe' });
      }
    }

    const role = await Role.findByIdAndUpdate(
      req.params.roleId,
      req.body,
      { new: true, runValidators: true }
    ).populate('permissions');

    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });
    return res.json(role);
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El nombre del rol ya existe' });
    }
    // 🟢 RECOMENDACIÓN: Aquí también deberías capturar CastError para IDs no válidos.
    if (error.name === 'CastError') {
         return res.status(400).json({ message: 'Error: El ID del Rol o de un Permiso no es válido.' });
    }
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar rol
export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.roleId);
    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });
    return res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    // 🟢 RECOMENDACIÓN: Aquí también deberías capturar CastError para IDs no válidos.
    if (error.name === 'CastError') {
         return res.status(400).json({ message: 'Error: El ID del Rol no es válido.' });
    }
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Agregar un permiso al rol (body opcional)
// POST /api/roles/:roleId/permissions  { permissionId: "..." }
export const addPermissionToRole = async (req, res) => {
  try {
    const { permissionId } = req.body;
    if (!permissionId) return res.status(400).json({ message: 'Falta permissionId en body' });

    const [role, permission] = await Promise.all([
      Role.findById(req.params.roleId),
      Permission.findById(permissionId)
    ]);

    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });
    if (!permission) return res.status(404).json({ message: 'Permiso no encontrado' });

    // evitar duplicados
    if (role.permissions.includes(permissionId)) {
      return res.status(400).json({ message: 'El permiso ya está asignado al rol' });
    }

    role.permissions.push(permissionId);
    await role.save();
    await role.populate('permissions');
    return res.json(role);
  } catch (error) {
    console.error('Error al agregar permiso al rol:', error);
    // 🟢 RECOMENDACIÓN: Aquí también deberías capturar CastError para IDs no válidos.
    if (error.name === 'CastError') {
         return res.status(400).json({ message: 'Error: El ID del Rol o Permiso no es válido.' });
    }
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Quitar un permiso del rol
// DELETE /api/roles/:roleId/permissions/:permissionId
export const removePermissionFromRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.params;
    const role = await Role.findById(roleId);
    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

    const idx = role.permissions.findIndex(p => p.toString() === permissionId);
    if (idx === -1) return res.status(404).json({ message: 'Permiso no asignado al rol' });

    role.permissions.splice(idx, 1);
    await role.save();
    await role.populate('permissions');
    return res.json(role);
  } catch (error) {
    console.error('Error al quitar permiso del rol:', error);
    // 🟢 RECOMENDACIÓN: Aquí también deberías capturar CastError para IDs no válidos.
    if (error.name === 'CastError') {
         return res.status(400).json({ message: 'Error: El ID del Rol o Permiso no es válido.' });
    }
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};