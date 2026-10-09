const express = require("express");

const router = express.Router();

const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

<<<<<<< Updated upstream
=======
const optionalAuth = require("../middleware/optionalAuth");

// Optional authentication lets us identify the staff member
// when a JWT is available without breaking existing requests.
router.use(optionalAuth);

>>>>>>> Stashed changes
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