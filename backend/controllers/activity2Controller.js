const Activity = require("../models/StaffActivity");
const User = require("../models/User");

// ==========================================
// GET STAFF ACTIVITIES
// ==========================================

const getStaffActivities = async (req, res) => {
  try {
    const {
      staff,
      module,
      action,
      fromDate,
      toDate,
      search,
    } = req.query;

    const filter = {};

    // Only activities performed by staff accounts
    const staffUsers = await User.find({
      role: "staff",
    }).select("_id");

    filter.user = {
      $in: staffUsers.map((user) => user._id),
    };

    // Filter by staff
    if (staff) {
      filter.user = staff;
    }

    // Filter by module
    if (module && module !== "All") {
      filter.module = module;
    }

    // Filter by action
    if (action && action !== "All") {
      filter.action = action;
    }

    // Date filtering
    if (fromDate || toDate) {
      filter.createdAt = {};

      if (fromDate) {
        const startDate = new Date(fromDate);
        startDate.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = startDate;
      }

      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    // Search by staff name, email, description or invoice
    if (search && search.trim()) {
      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      filter.$or = [
        {
          staffName: searchRegex,
        },
        {
          staffEmail: searchRegex,
        },
        {
          description: searchRegex,
        },
        {
          invoiceNumber: searchRegex,
        },
      ];
    }

    const activities = await Activity.find(filter)
      .populate("user", "name email role staffRole")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      activities,
      count: activities.length,
    });
  } catch (error) {
    console.error(
      "Get staff activities error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch staff activities",
      error: error.message,
    });
  }
};

// ==========================================
// GET STAFF ACTIVITY SUMMARY
// ==========================================

const getStaffActivitySummary = async (req, res) => {
  try {
    const {
      staff,
      module,
      action,
      fromDate,
      toDate,
    } = req.query;

    const filter = {};

    // Get staff users
    const staffUsers = await User.find({
      role: "staff",
    }).select("_id");

    filter.user = {
      $in: staffUsers.map((user) => user._id),
    };

    if (staff) {
      filter.user = staff;
    }

    if (module && module !== "All") {
      filter.module = module;
    }

    if (action && action !== "All") {
      filter.action = action;
    }

    if (fromDate || toDate) {
      filter.createdAt = {};

      if (fromDate) {
        const startDate = new Date(fromDate);
        startDate.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = startDate;
      }

      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    const totalActivities =
      await Activity.countDocuments(filter);

    const createActivities =
      await Activity.countDocuments({
        ...filter,
        action: "CREATE",
      });

    const updateActivities =
      await Activity.countDocuments({
        ...filter,
        action: "UPDATE",
      });

    const deleteActivities =
      await Activity.countDocuments({
        ...filter,
        action: "DELETE",
      });

    res.status(200).json({
      success: true,
      summary: {
        totalActivities,
        createActivities,
        updateActivities,
        deleteActivities,
      },
    });
  } catch (error) {
    console.error(
      "Staff activity summary error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch activity summary",
      error: error.message,
    });
  }
};

// ==========================================
// GET ACTIVITY BY ID
// ==========================================

const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(
      req.params.id
    ).populate(
      "user",
      "name email role staffRole"
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.status(200).json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error(
      "Get activity error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch activity",
      error: error.message,
    });
  }
};

module.exports = {
  getStaffActivities,
  getStaffActivitySummary,
  getActivityById,
};