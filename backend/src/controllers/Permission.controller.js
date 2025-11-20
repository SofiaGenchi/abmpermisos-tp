import Permission from '../models/Permission.model.js';

// saca los espacios y convierte en string,
// elimina elementos vacios y convierte todo a minusculas
function normalizeRoles(input){
    if(!input) return undefined;
    let arr = [];
    if(Array.isArray(input)) arr = input;
    else if(typeof input === 'string') arr = input.split(',');
    else return undefined;

    return arr
        .map(r => (r||'').toString().trim())
        .filter(Boolean)
        .map(r => r.toLowerCase());
}


// metodo GET, listar los permisos
export const getPermission = async (req, res, next) => {
    try {
        const permissions = await Permission.find();

        const mapped = (permissions || []).map(p => ({
            id: p._id.toString(),
            name: p.name,
            description: p.description,
            roles: p.roles || [],
            createdAt: p.createdAt
        }));

        return res.status(200).json({
            message: mapped.length ? 'Permisos obtenidos exitosamente' : 'No hay permisos creados',
            data: mapped
        });
    }catch (error){
        next(error);
    }
};

//POST, crear nuevo permiso
export const createPermission = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const roles = normalizeRoles(req.body.roles) || ['admin'];

        if(!name) return res.status(400).json({ message: 'El campo name es requerido' });

        const newPermission = new Permission({ name, description: description || '', roles });
        await newPermission.save();

        return res.status(201).json({ id: newPermission._id.toString(), name: newPermission.name, description: newPermission.description, roles: newPermission.roles });
    }catch(error){
        next(error);
    }
};

//put, editar permisos, modificar/update
export const updatePermission = async (req, res, next) => {
    try {
        const payload = { ...req.body };
        if(req.body.roles !== undefined){
            const r = normalizeRoles(req.body.roles);
            if(!r) return res.status(400).json({ message: 'roles debe ser un array o una cadena separada por comas' });
            payload.roles = r;
        }

        const updatePermission = await Permission.findByIdAndUpdate(
            req.params.permissionId,
            payload,
            { new: true, runValidators: true }
        );

        if(!updatePermission){
            const err = new Error('El permiso no existe');
            err.name = 'CastError';
            return next(err);
        }
        return res.status(200).json({ id: updatePermission._id.toString(), name: updatePermission.name, description: updatePermission.description, roles: updatePermission.roles });
    }catch(error){
        next(error);
    }
};

//delete, eliminar permiso
export const deletePermission = async (req, res, next) => {
    try {
        const deletedPermission = await Permission.findByIdAndDelete(req.params.permissionId);

        if(!deletedPermission){
            const err = new Error('El permiso no existe');
            err.name = 'CastError';
            return next(err);
        }
        return res.status(200).json({
            message: 'Permiso eliminado correctamente...'
        });
    }catch(error){
        next(error);
    }
};