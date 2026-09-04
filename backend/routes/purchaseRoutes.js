
const express = require("express");

const {
  getPurchases,
  getPurchaseById,
  createPurchase,
  deletePurchase,
} = require("../controllers/purchaseController");

const router = express.Router();

router.get("/", getPurchases);
router.get("/:id", getPurchaseById);
router.post("/", createPurchase);
router.delete("/:id", deletePurchase);

module.exports = router;
