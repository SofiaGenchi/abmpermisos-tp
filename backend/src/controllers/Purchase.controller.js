// controllers/Purchase.controller.js
import Purchase from '../models/Purchase.model.js';

export const getMyPurchases = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const purchases = await Purchase.find({ user: req.session.userId })
      .sort({ createdAt: -1 })
      .populate('details.product', 'name description price');

    const mapped = purchases.map(p => ({
      id: p._id.toString(),
      total: p.total,
      createdAt: p.createdAt,
      details: p.details.map(d => ({
        productId: d.product?._id?.toString() || null,
        name: d.name,
        priceUnit: d.priceUnit,
        quantity: d.quantity,
        subtotal: d.subtotal
      }))
    }));

    return res.status(200).json({
      message: mapped.length ? 'Compras obtenidas' : 'No tenés compras registradas',
      data: mapped
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username') // solo traemos username
      .populate('details.product', 'name');

    const mapped = purchases.map(p => ({
      id: p._id.toString(),
      user: p.user
        ? { id: p.user._id.toString(), username: p.user.username }
        : null,
      total: p.total,
      createdAt: p.createdAt,
      details: p.details.map(d => ({
        name: d.name,
        quantity: d.quantity,
        priceUnit: d.priceUnit,
        subtotal: d.subtotal
      }))
    }));

    return res.status(200).json({
      message: mapped.length ? 'Compras obtenidas' : 'No hay compras registradas',
      data: mapped
    });
  } catch (error) {
    next(error);
  }
};