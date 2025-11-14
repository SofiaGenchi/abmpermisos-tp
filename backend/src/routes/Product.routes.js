import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/Product.controller.js';
import requireAdmin from '../middlewares/admin.js';

const router = Router();

// public
router.get('/', getProducts);

// admin (protected) - for development we accept query ?admin=1 or session.isAdmin
router.post('/', requireAdmin, createProduct);
router.put('/:productId', requireAdmin, updateProduct);
router.delete('/:productId', requireAdmin, deleteProduct);

export default router;
