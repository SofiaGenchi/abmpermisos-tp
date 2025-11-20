import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import bcrypt from 'bcrypt';
import Purchase from '../models/Purchase.model.js';

export const register = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        console.log('Register attempt body:', req.body);
        if(!username || !password) return res.status(400).json({ error: 'Faltan datos' });

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const newUser = new User({ username, password: hashed, role: 'user' });
        await newUser.save();
        console.log('Usuario creado:', newUser._id);

        return res.status(201).json({ message: 'Usuario creado' });
    }catch(error){
        console.error('Error en registro:', error);
        return next(error);
    }
};

export const login = async (req, res, next) => {
    try{
        const { username, password } = req.body;
        if(!username || !password) return res.status(400).json({ error: 'Faltan datos' });

        const user = await User.findOne({ username });
        if(!user) return res.status(401).json({ error: 'Credenciales invalidas' });

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(401).json({ error: 'Credenciales invalidas' });

        // guardar en session
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.role = user.role || 'user';

        return res.status(200).json({ message: 'Autenticado', role: req.session.role, username: user.username });
    }catch(error){
        next(error);
    }
};

export const logout = (req, res, next) => {
    req.session.destroy(err => {
        if(err) return next(err);
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Sesion cerrada' });
    });
};

export const me = async (req, res, next) => {
    try{
        if(!req.session || !req.session.userId) return res.status(401).json({ error: 'No autenticado' });
        const user = await User.findById(req.session.userId).select('username cart role');
        if(!user) return res.status(401).json({ error: 'No autenticado' });

        return res.status(200).json({ username: user.username, cart: user.cart, role: user.role });
    }catch(error){
        next(error);
    }
};

export const addToCart = async (req, res, next) => {
    try{
        console.log('addToCart called - session:', req.session, 'body:', req.body);
        if(!req.session || !req.session.userId) return res.status(401).json({ error: 'No autenticado' });
    let { product } = req.body;
        if(!product) return res.status(400).json({ error: 'Producto invalido' });

        const prodId = product.productId || product._id;

        let prodData = null;
        if(prodId){
            prodData = await Product.findById(prodId).lean();
            if(prodData){
                product = { productId: prodData._id.toString(), name: prodData.name, description: prodData.description, price: prodData.price };
            }
        }

        if(!product.productId && prodId) product.productId = prodId;
        if(!product.productId) return res.status(400).json({ error: 'Producto invalido' });

        const user = await User.findById(req.session.userId);
        if(!user) return res.status(401).json({ error: 'No autenticado' });

        const existing = user.cart.find(p => p.productId === product.productId);
        if(existing){
            existing.quantity += 1;
        }else{
            user.cart.push({
                productId: product.productId,
                name: product.name || '',
                description: product.description || '',
                price: product.price || 0,
                quantity: 1
            });
        }

        await user.save();

        return res.status(200).json({ message: 'Producto agregado', cart: user.cart });
    }catch(error){
        next(error);
    }
};

export const updateCartItem = async (req, res, next) => {
    try{
        if(!req.session || !req.session.userId) return res.status(401).json({ error: 'No autenticado' });
        const { productId, quantity } = req.body;
        if(!productId || typeof quantity !== 'number') return res.status(400).json({ error: 'Datos invalidos' });

        const user = await User.findById(req.session.userId);
        if(!user) return res.status(401).json({ error: 'No autenticado' });

        const item = user.cart.find(p => p.productId === productId);
        if(!item) return res.status(404).json({ error: 'Producto no en el carrito' });

        if(quantity <= 0){
            user.cart = user.cart.filter(p => p.productId !== productId);
        }else{
            item.quantity = quantity;
        }

        await user.save();
        return res.status(200).json({ message: 'Carrito actualizado', cart: user.cart });
    }catch(error){
        next(error);
    }
};

export const removeCartItem = async (req, res, next) => {
    try{
        if(!req.session || !req.session.userId) return res.status(401).json({ error: 'No autenticado' });
        const { productId } = req.body;
        if(!productId) return res.status(400).json({ error: 'Datos invalidos' });

        const user = await User.findById(req.session.userId);
        if(!user) return res.status(401).json({ error: 'No autenticado' });

        user.cart = user.cart.filter(p => p.productId !== productId);
        await user.save();
        return res.status(200).json({ message: 'Producto eliminado', cart: user.cart });
    }catch(error){
        next(error);
    }
};

export const checkoutCart = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    const originalCart = Array.isArray(user.cart) ? user.cart : [];

    let cart = originalCart.filter(item => {
      const qty = Number(item.quantity);
      return Number.isFinite(qty) && qty > 0;
    });

    if (cart.length !== originalCart.length) {
      user.cart = cart;
      await user.save();
    }

    if (!cart.length) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    const productIds = cart.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map();
    products.forEach(p => {
      productMap.set(p._id.toString(), p);
    });

    let total = 0;
    const details = [];

    for (const item of cart) {
      const prod = productMap.get(item.productId);
      if (!prod) {
        const err = new Error(`Producto no encontrado: ${item.productId}`);
        err.status = 400;
        return next(err);
      }

      const quantity = Number(item.quantity);
      const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

      if (qty > prod.stock) {
        const err = new Error(
          `Stock insuficiente para "${prod.name}". Disponible: ${prod.stock}, solicitado: ${qty}`
        );
        err.status = 400;
        return next(err);
      }

      const priceUnit = prod.price;
      const subtotal = priceUnit * qty;
      total += subtotal;

      details.push({
        product: prod._id,
        name: prod.name,
        priceUnit,
        quantity: qty,
        subtotal
      });
    }

    for (const item of cart) {
      const prod = productMap.get(item.productId);
      const quantity = Number(item.quantity);
      const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

      prod.stock = prod.stock - qty;
      if (prod.stock < 0) {
        const err = new Error(`Error de stock al actualizar producto ${prod.name}`);
        err.status = 500;
        return next(err);
      }

      await prod.save();
    }

    const purchase = await Purchase.create({
      user: user._id,
      details,
      total
    });

    user.cart = [];
    await user.save();

    return res.status(201).json({
      message: 'Compra realizada con éxito',
      purchase: {
        id: purchase._id.toString(),
        total: purchase.total,
        createdAt: purchase.createdAt,
        details: purchase.details
      }
    });
  } catch (error) {
    next(error);
  }
};
