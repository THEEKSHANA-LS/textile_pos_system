const Order = require('../models/Order');
const Product = require('../models/Product');

const addOrderItems = async (req, res, next) => {
  try {
    const {
      customerId,
      orderItems,
      paymentMethod,
      itemsPrice,
      taxPrice,
      totalPrice,
      discount
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    } else {
      // Create Invoice Number e.g., INV-168123123
      const invoiceNumber = `INV-${Date.now()}`;

      // Deduct stock for each item
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          if (product.stock < item.quantity) {
             res.status(400);
             throw new Error(`Insufficient stock for ${product.name}`);
          }
          product.stock -= item.quantity;
          await product.save();
        }
      }

      const order = new Order({
        invoiceNumber,
        customer: customerId || null,
        items: orderItems,
        totalAmount: totalPrice,
        discount: discount || 0,
        tax: taxPrice || 0,
        paymentMethod,
        createdBy: req.user._id,
      });

      const createdOrder = await order.save();

      res.status(201).json(createdOrder);
    }
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('customer', 'name').populate('createdBy', 'name');
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = { addOrderItems, getOrders };
