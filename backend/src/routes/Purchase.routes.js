import { Router } from "express";
import { getMyPurchases, getAllPurchases } from "../controllers/Purchase.controller.js";
import requirePermission from "../middlewares/permission.js";
import requireAdmin from "../middlewares/admin.js";

const router = Router();

//historial de compras del usuario autenticado
router.get('/mine', requirePermission('ver_compras'), getMyPurchases);
router.get(
    '/',
    requireAdmin,
    requirePermission("ver_compras"),
    getAllPurchases
);

export default router;