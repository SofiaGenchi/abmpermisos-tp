import express from 'express';
import { createPermission, deletePermission, getPermissions, updatePermission } from '../controllers/Permission.controller.js';

const router = express.Router();

//para listar permisos
router.get('/', getPermissions);

//para crear un nuevo permiso
router.post('/', createPermission);

//editar permiso
router.put('/:permissionId', updatePermission);

//eliminar permiso
router.delete('/:permissionId', deletePermission);

export default router;