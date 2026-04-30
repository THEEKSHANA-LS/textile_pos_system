const express = require('express');
const router = express.Router();
const { addOrderItems, getOrders } = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, getOrders);

module.exports = router;
