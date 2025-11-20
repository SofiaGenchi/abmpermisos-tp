import { Router } from 'express';
import { register, login, logout, me, addToCart, updateCartItem, removeCartItem, checkoutCart } from '../controllers/Auth.controller.js';
import requirePermission from '../middlewares/permission.js';


const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', me);
router.post('/cart', addToCart);
router.put('/cart', updateCartItem);
router.delete('/cart', removeCartItem);
router.post('/cart/checkout', requirePermission('crear_compra'), checkoutCart);

export default router;
