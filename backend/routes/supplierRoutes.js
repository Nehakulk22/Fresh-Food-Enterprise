const express = require("express");

const router = express.Router();

const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

<<<<<<< Updated upstream
// Get all suppliers
router.get("/", getSuppliers);

// Get one supplier
=======
const optionalAuth = require("../middleware/optionalAuth");

// Optional authentication
// Allows us to identify the logged-in staff member
// when a valid JWT is available.
router.use(optionalAuth);

// Get all suppliers
router.get("/", getSuppliers);

// Get single supplier
>>>>>>> Stashed changes
router.get("/:id", getSupplierById);

// Create supplier
router.post("/", createSupplier);

// Update supplier
router.put("/:id", updateSupplier);

// Delete supplier
router.delete("/:id", deleteSupplier);

module.exports = router;