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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

    const getRevenue = async (startDate) => {
      const agg = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]);
      return agg.length > 0 ? agg[0].totalRevenue : 0;
    };

    const todayRevenue = await getRevenue(today);
    const monthRevenue = await getRevenue(firstDayOfMonth);
    const yearRevenue = await getRevenue(firstDayOfYear);

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
      todayRevenue,
      monthRevenue,
      yearRevenue,
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
