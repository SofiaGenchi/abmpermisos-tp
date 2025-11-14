import { Router } from 'express';
import { register, login, logout, me, addToCart, updateCartItem, removeCartItem } from '../controllers/Auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', me);
router.post('/cart', addToCart);
router.put('/cart', updateCartItem); // body: { productId, quantity }
router.delete('/cart', removeCartItem); // body: { productId }

export default router;
