const Customer = require("../models/Customer");

// GET ALL CUSTOMERS
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(customers);
  } catch (error) {
    console.error("Get customers error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET SINGLE CUSTOMER
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(
      req.params.id
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error("Get customer error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// CREATE CUSTOMER
const createCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      openingBalance,
      notes,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Customer name and phone are required",
      });
    }

    const customer = await Customer.create({
      name,
      phone,
      email,
      address,
      openingBalance: openingBalance || 0,
      notes,
    });

    res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// UPDATE CUSTOMER
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(
      req.params.id
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const {
      name,
      phone,
      email,
      address,
      openingBalance,
      notes,
    } = req.body;

    customer.name = name ?? customer.name;
    customer.phone = phone ?? customer.phone;
    customer.email = email ?? customer.email;
    customer.address = address ?? customer.address;
    customer.openingBalance =
      openingBalance ?? customer.openingBalance;
    customer.notes = notes ?? customer.notes;

    await customer.save();

    res.status(200).json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// DELETE CUSTOMER
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(
      req.params.id
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    customer.isActive = false;

    await customer.save();

    res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};