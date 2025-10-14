import { Router } from "express";
import { createPermission, deletePermission, getPermission, updatePermission } from "../controllers/Permission.controller.js";


const router = Router();

router.get('/', getPermission);
router.post('/', createPermission);
router.put('/:permissionId', updatePermission);
router.delete('/:permissionId', deletePermission);

export default router;