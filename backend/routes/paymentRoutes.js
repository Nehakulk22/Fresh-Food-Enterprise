const express = require("express");

const router = express.Router();

const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentSummary,
} = require("../controllers/paymentController");

const optionalAuth = require("../middleware/optionalAuth");

router.use(optionalAuth);

// Create payment
router.post("/", createPayment);

// Get payment summary
router.get("/summary", getPaymentSummary);

// Get all payments
router.get("/", getPayments);

// Get single payment
router.get("/:id", getPaymentById);

// Update payment
router.put("/:id", updatePayment);

// Delete payment
router.delete("/:id", deletePayment);

module.exports = router;