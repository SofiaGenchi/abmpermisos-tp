import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/Product.controller.js';
import requireAdmin from '../middlewares/admin.js';
import requirePermission from '../middlewares/permission.js';

const router = Router();

// public
router.get('/', getProducts);

router.post('/', requireAdmin, requirePermission('gestionar_productos'), createProduct);
router.put('/:productId', requireAdmin, requirePermission('gestionar_productos'), updateProduct);
router.delete('/:productId', requireAdmin, requirePermission('gestionar_productos'), deleteProduct);

export default router;
