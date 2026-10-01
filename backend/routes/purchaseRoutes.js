const express = require("express");

const {
  getPurchases,
  getPurchaseById,
  createPurchase,
  deletePurchase,
} = require("../controllers/purchaseController");

const optionalAuth = require("../middleware/optionalAuth");

const router = express.Router();

router.use(optionalAuth);

router.get("/", getPurchases);

router.get("/:id", getPurchaseById);

router.post("/", createPurchase);

router.delete("/:id", deletePurchase);

module.exports = router;