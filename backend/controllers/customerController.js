const Customer = require('../models/Customer');

const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find({});
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;
    const customer = new Customer({ name, phone, email });
    const createdCustomer = await customer.save();
    res.status(201).json(createdCustomer);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers, createCustomer };
