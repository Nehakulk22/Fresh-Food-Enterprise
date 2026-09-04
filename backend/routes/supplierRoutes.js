const express = require("express");

const router = express.Router();

const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

// Get all suppliers
router.get("/", getSuppliers);

// Get one supplier
router.get("/:id", getSupplierById);

// Create supplier
router.post("/", createSupplier);

// Update supplier
router.put("/:id", updateSupplier);

// Delete supplier
router.delete("/:id", deleteSupplier);

module.exports = router;