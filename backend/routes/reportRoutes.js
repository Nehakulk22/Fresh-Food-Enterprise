const express = require("express");

const router = express.Router();

const {
  getReportSummary,
  getSalesReport,
  getPurchaseReport,
  getPaymentReport,
  getInventoryReport,
} = require("../controllers/reportController");


// =====================================================
// REPORT SUMMARY
// =====================================================

router.get(
  "/summary",
  getReportSummary
);


// =====================================================
// SALES REPORT
// =====================================================

router.get(
  "/sales",
  getSalesReport
);


// =====================================================
// PURCHASE REPORT
// =====================================================

router.get(
  "/purchases",
  getPurchaseReport
);


// =====================================================
// PAYMENT REPORT
// =====================================================

router.get(
  "/payments",
  getPaymentReport
);


// =====================================================
// INVENTORY REPORT
// =====================================================

router.get(
  "/inventory",
  getInventoryReport
);


module.exports = router;