import Permission from '../models/Permission.model.js';

export const getPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find();

        if(!permissions || permissions.length === 0){
            return res.status(404).json({ message: 'No hay permisos cargados' });
        }
        return res.json(permissions);
    }catch(error){
        console.log('Error al obtener los permisos:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

//crear nuevo permiso
export const createPermission = async (req, res) => {
    try {
        const newPermission = new Permission(req.body);

        if(!newPermission.name){
            return res.status(400).json({ message: 'El campo "name" es obligatorio' });
        }
        await newPermission.save();
        return res.status(201).json(newPermission);
    }catch(error){
        console.error('Error al crear el permiso:', error);

        if(error.code === 11000){
            return res.status(400).json({
                message: 'Error: El nombre del permiso ya existe. Debe ser unico.'
            });
        }
        return res.status(500).json({ message: 'Error interno en el servidor' });
    }
};


//editar permiso
export const updatePermission = async (req, res) => {
    try {
        const updatePermission = await Permission.findByIdAndUpdate(req.params.permissionId,
            req.body,
            { new: true, runValidators: true }
        );

        if(!updatePermission){
            return res.status(404).json({ message: 'El permiso no existe' });
        }
        return res.status(200).json(updatePermission);
    } catch (error) {
        console.error('Error al actualizar el permiso:', error);

        if(error.code === 11000){
            return res.status(400).json({
                message: 'Error: El nombre del permiso ya existe. Debe ser unico.'
            }); 
        }
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

//para eliminar permisos
export const deletePermission = async (req, res) => {
    try {
        const deletePermission = await Permission.findByIdAndDelete(req.params.permissionId);

        if(!deletePermission) {
            return res.status(404).json({ message: 'El permiso no existe' });
        }
        return res.status(200).json({ message: 'Permiso eliminado correctamente' });
    }catch(error){
        console.error('Error al eliminar el permiso:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};