const express = require("express");

const router = express.Router();

const {
  getStaff,
  getStaffSummary,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffActivities,
  getStaffActivitySummary,
} = require("../controllers/staffController");

const protect = require("../middleware/authMiddleware");
const ownerOnly = require("../middleware/ownerMiddleware");

// ======================================================
// STAFF MANAGEMENT
// ======================================================

router.get(
  "/summary",
  protect,
  ownerOnly,
  getStaffSummary
);

router.get(
  "/",
  protect,
  ownerOnly,
  getStaff
);

router.post(
  "/",
  protect,
  ownerOnly,
  createStaff
);

router.put(
  "/:id",
  protect,
  ownerOnly,
  updateStaff
);

router.delete(
  "/:id",
  protect,
  ownerOnly,
  deleteStaff
);

// ======================================================
// STAFF ACTIVITY
// ======================================================

router.get(
  "/activity/summary",
  protect,
  ownerOnly,
  getStaffActivitySummary
);

router.get(
  "/activity",
  protect,
  ownerOnly,
  getStaffActivities
);

module.exports = router;