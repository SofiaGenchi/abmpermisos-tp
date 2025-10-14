import Permission from '../models/Permission.model.js';


// metodo GET, listar los permisos
export const getPermission = async (req, res, next) => {
    try {
        const permissions = await Permission.find();

        if(!permissions || permissions.length === 0){
            return res.status(200).json({
                message: 'No hay permisos creados',
                data: []
            });
        }

        return res.status(200).json({
            message: 'Permisos obtenidos exitosamente',
            data: permissions
        });
    }catch (error){
        next(error);
    }
};

//POST, crear nuevo permiso
export const createPermission = async (req, res, next) => {
    try {
        const newPermission = new Permission(req.body);
        await newPermission.save();

        return res.status(201).json(newPermission);
    }catch(error){
        next(error);
    }
};

//put, editar permisos, modificar/update
export const updatePermission = async (req, res, next) => {
    try {
        const updatePermission = await Permission.findByIdAndUpdate(
            req.params.permissionId,
            req.body,
            { new: true, runValidators: true }
        );

        if(!updatePermission){
            const err = new Error('El permiso no existe');
            err.name = 'CastError';
            return next(err);
        }
        return res.status(200).json(updatePermission);
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