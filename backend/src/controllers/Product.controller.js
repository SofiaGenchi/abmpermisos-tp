import Product from "../models/Product.model.js";

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();

    const mapped = products.map((p) => ({
      productId: p._id.toString(),
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
    }));

    return res.status(200).json({ data: mapped });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock } = req.body;
    const p = new Product({ name, description, price, stock });
    await p.save();
    return res
      .status(201)
      .json({
        productId: p._id.toString(),
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock
      });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      const err = new Error("Producto no encontrado");
      err.status = 404;
      return next(err);
    }
    return res
      .status(200)
      .json({
        productId: updated._id.toString(),
        name: updated.name,
        description: updated.description,
        price: updated.price,
        stock: updated.stock
      });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.productId);
    if (!deleted) {
      const err = new Error("Producto no encontrado");
      err.status = 404;
      return next(err);
    }
    return res.status(200).json({ message: "Producto eliminado" });
  } catch (error) {
    next(error);
  }
};
