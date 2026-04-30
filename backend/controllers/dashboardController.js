const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

const getDashboardSummary = async (req, res, next) => {
  try {
    // Basic aggregation for summary
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    
    // Revenue Calculation
    const revenueAggregation = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // Recent Orders
    const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5).populate('customer', 'name');

    // Popular Products / Low Stock Products
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } }).limit(5);

    res.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      recentOrders,
      lowStockProducts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };
