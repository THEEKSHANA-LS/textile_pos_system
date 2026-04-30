const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String },
  price: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  size: { type: String },
  color: { type: String },
  barcode: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
