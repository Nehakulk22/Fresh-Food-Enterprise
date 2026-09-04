const express = require("express");

const router = express.Router();

const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

// Get all customers
router.get("/", getCustomers);

// Get one customer
router.get("/:id", getCustomerById);

// Create customer
router.post("/", createCustomer);

// Update customer
router.put("/:id", updateCustomer);

// Delete customer
router.delete("/:id", deleteCustomer);

module.exports = router;