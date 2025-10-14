import express from 'express';
import { addPermissionToRole, createRole, deleteRole, getRoleById, getRoles, removePermissionFromRole, updateRole } from '../controllers/Role.controller.js';

const router = express.Router();

router.get('/', getRoles);
router.get('/:roleId', getRoleById);

router.post('/', createRole);

router.put('/:roleId', updateRole);

router.delete('/:roleId', deleteRole);

router.post('/:roleId/permissions', addPermissionToRole);
router.delete('/:roleId/permissions/:permissionId', removePermissionFromRole);

export default router;