const express = require("express");

const router = express.Router();

const {
  getStaffActivities,
  getStaffActivitySummary,
  getActivityById,
} = require("../controllers/activity2Controller");

const protect = require("../middleware/authMiddleware");
const ownerOnly = require("../middleware/ownerMiddleware");

// Only logged-in owner can monitor staff activity
router.use(protect);
router.use(ownerOnly);

// IMPORTANT:
// summary must come before /:id
router.get(
  "/summary",
  getStaffActivitySummary
);

router.get(
  "/",
  getStaffActivities
);

router.get(
  "/:id",
  getActivityById
);

module.exports = router;