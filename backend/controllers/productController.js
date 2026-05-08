const Product = require('../models/Product');

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, category, brand, price, costPrice, stock, size, color, barcode } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    
    const product = new Product({
      name, category, brand, price, costPrice, stock, size, color, barcode, image
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { name, category, brand, price, costPrice, stock, size, color, barcode } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.price = price !== undefined ? price : product.price;
      product.costPrice = costPrice !== undefined ? costPrice : product.costPrice;
      product.stock = stock !== undefined ? stock : product.stock;
      product.size = size || product.size;
      product.color = color || product.color;
      product.barcode = barcode || product.barcode;

      if (req.file) {
        product.image = `/uploads/${req.file.filename}`;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
