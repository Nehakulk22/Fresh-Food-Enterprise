const User = require("../models/User");
const Activity = require("../models/Activity");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const logActivity = require("../utils/activityLogger");

// ======================================================
// HELPERS
// ======================================================

const formatStaff = (staff) => {
  const obj = staff.toObject ? staff.toObject() : staff;

  return {
    ...obj,

    // Frontend expects "role" as employee job role
    role: obj.staffRole || "",

    // Frontend expects Active / Inactive
    status: obj.isActive ? "Active" : "Inactive",
  };
};

const validPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(String(phone || "").trim());
};

const validEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email || "").trim()
  );
};

const validObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ======================================================
// GET STAFF
// GET /api/staff
// ======================================================

const getStaff = async (req, res) => {
  try {
    const { search = "", status = "" } = req.query;

    const query = {
      role: "staff",
    };

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");

      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { staffRole: regex },
      ];
    }

    if (status === "Active") {
      query.isActive = true;
    }

    if (status === "Inactive") {
      query.isActive = false;
    }

    const staff = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      staff: staff.map(formatStaff),
    });
  } catch (error) {
    console.error("Get staff error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch staff.",
    });
  }
};

// ======================================================
// GET STAFF SUMMARY
// GET /api/staff/summary
// ======================================================

const getStaffSummary = async (req, res) => {
  try {
    const staff = await User.find({
      role: "staff",
    }).select("isActive salary");

    const totalStaff = staff.length;

    const activeStaff = staff.filter(
      (member) => member.isActive
    ).length;

    const inactiveStaff = staff.filter(
      (member) => !member.isActive
    ).length;

    const totalSalary = staff.reduce(
      (total, member) => total + Number(member.salary || 0),
      0
    );

    res.json({
      success: true,
      summary: {
        totalStaff,
        activeStaff,
        inactiveStaff,
        totalSalary: Number(totalSalary.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Staff summary error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch staff summary.",
    });
  }
};

// ======================================================
// CREATE STAFF
// POST /api/staff
// ======================================================

const createStaff = async (req, res) => {
  try {
    const {
      name,
      role,
      phone,
      email,
      password,
      joiningDate,
      salary,
      status,
      address,
      notes,
      permissions,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Staff name is required.",
      });
    }

    if (!role || !role.trim()) {
      return res.status(400).json({
        success: false,
        message: "Staff job role is required.",
      });
    }

    if (!phone || !validPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit Indian mobile number.",
      });
    }

    if (!email || !validEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
    }

    if (!joiningDate) {
      return res.status(400).json({
        success: false,
        message: "Joining date is required.",
      });
    }

    const joining = new Date(joiningDate);

    if (Number.isNaN(joining.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid joining date.",
      });
    }

    if (joining > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Joining date cannot be in the future.",
      });
    }

    const salaryValue = Number(salary);

    if (Number.isNaN(salaryValue) || salaryValue < 0) {
      return res.status(400).json({
        success: false,
        message: "Salary must be a valid non-negative number.",
      });
    }

    if (address && address.length > 250) {
      return res.status(400).json({
        success: false,
        message: "Address cannot exceed 250 characters.",
      });
    }

    if (notes && notes.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Notes cannot exceed 500 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim(),

      // IMPORTANT:
      // System role remains "staff"
      role: "staff",

      // Employee job role
      staffRole: role.trim(),

      joiningDate: joining,
      salary: salaryValue,

      isActive: status !== "Inactive",

      address: address ? address.trim() : "",
      notes: notes ? notes.trim() : "",

      permissions: {
        dashboard: permissions?.dashboard ?? true,
        customers: permissions?.customers ?? false,
        suppliers: permissions?.suppliers ?? false,
        products: permissions?.products ?? false,
        sales: permissions?.sales ?? false,
        purchases: permissions?.purchases ?? false,
        payments: permissions?.payments ?? false,
        expenses: permissions?.expenses ?? false,
        reports: permissions?.reports ?? false,
        staff: false,
        staffActivity: false,
        settings: false,
      },
    });

    await logActivity({
      user: req.user,
      module: "Staff",
      action: "CREATE",
      description: `Created staff member ${newStaff.name}`,
      recordId: newStaff._id,
      recordType: "User",
      metadata: {
        staffName: newStaff.name,
        staffEmail: newStaff.email,
      },
    });

    res.status(201).json({
      success: true,
      message: "Staff member created successfully.",
      staff: formatStaff(newStaff),
    });
  } catch (error) {
    console.error("Create staff error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create staff member.",
    });
  }
};

// ======================================================
// UPDATE STAFF
// PUT /api/staff/:id
// ======================================================

const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID.",
      });
    }

    const staff = await User.findOne({
      _id: id,
      role: "staff",
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found.",
      });
    }

    const {
      name,
      role,
      phone,
      email,
      password,
      joiningDate,
      salary,
      status,
      address,
      notes,
      permissions,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Staff name is required.",
      });
    }

    if (!role || !role.trim()) {
      return res.status(400).json({
        success: false,
        message: "Staff job role is required.",
      });
    }

    if (!phone || !validPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit Indian mobile number.",
      });
    }

    if (!email || !validEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailExists = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered by another user.",
      });
    }

    const salaryValue = Number(salary);

    if (Number.isNaN(salaryValue) || salaryValue < 0) {
      return res.status(400).json({
        success: false,
        message: "Salary must be a valid non-negative number.",
      });
    }

    if (joiningDate) {
      const joining = new Date(joiningDate);

      if (Number.isNaN(joining.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid joining date.",
        });
      }

      if (joining > new Date()) {
        return res.status(400).json({
          success: false,
          message: "Joining date cannot be in the future.",
        });
      }

      staff.joiningDate = joining;
    }

    if (address && address.length > 250) {
      return res.status(400).json({
        success: false,
        message: "Address cannot exceed 250 characters.",
      });
    }

    if (notes && notes.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Notes cannot exceed 500 characters.",
      });
    }

    staff.name = name.trim();
    staff.email = normalizedEmail;
    staff.phone = phone.trim();

    // Never change system role from staff.
    staff.role = "staff";

    // Employee job role
    staff.staffRole = role.trim();

    staff.salary = salaryValue;
    staff.isActive = status !== "Inactive";
    staff.address = address ? address.trim() : "";
    staff.notes = notes ? notes.trim() : "";

    if (permissions) {
      staff.permissions = {
        dashboard: permissions.dashboard ?? true,
        customers: permissions.customers ?? false,
        suppliers: permissions.suppliers ?? false,
        products: permissions.products ?? false,
        sales: permissions.sales ?? false,
        purchases: permissions.purchases ?? false,
        payments: permissions.payments ?? false,
        expenses: permissions.expenses ?? false,
        reports: permissions.reports ?? false,
        staff: false,
        staffActivity: false,
        settings: false,
      };
    }

    if (password && password.trim()) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must contain at least 6 characters.",
        });
      }

      staff.password = await bcrypt.hash(password, 10);
    }

    await staff.save();

    await logActivity({
      user: req.user,
      module: "Staff",
      action: "UPDATE",
      description: `Updated staff member ${staff.name}`,
      recordId: staff._id,
      recordType: "User",
      metadata: {
        staffName: staff.name,
        staffEmail: staff.email,
      },
    });

    res.json({
      success: true,
      message: "Staff member updated successfully.",
      staff: formatStaff(staff),
    });
  } catch (error) {
    console.error("Update staff error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update staff member.",
    });
  }
};

// ======================================================
// DELETE STAFF
// DELETE /api/staff/:id
// ======================================================

const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID.",
      });
    }

    const staff = await User.findOne({
      _id: id,
      role: "staff",
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found.",
      });
    }

    const staffName = staff.name;
    const staffEmail = staff.email;

    await logActivity({
      user: req.user,
      module: "Staff",
      action: "DELETE",
      description: `Deleted staff member ${staffName}`,
      recordId: staff._id,
      recordType: "User",
      metadata: {
        staffName,
        staffEmail,
      },
    });

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Staff member deleted successfully.",
    });
  } catch (error) {
    console.error("Delete staff error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete staff member.",
    });
  }
};

// ======================================================
// GET STAFF ACTIVITIES
// GET /api/staff/activity
// ======================================================

const getStaffActivities = async (req, res) => {
  try {
    const {
      staffId = "",
      module = "",
      action = "",
      fromDate = "",
      toDate = "",
    } = req.query;

    const query = {};

    // Only business activities
    query.module = {
      $in: [
        "Customer",
        "Supplier",
        "Product",
        "Sale",
        "Purchase",
        "Payment",
      ],
    };

    if (staffId) {
      if (!validObjectId(staffId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid staff ID.",
        });
      }

      query.user = staffId;
    }

    if (module) {
      query.module = module;
    }

    if (action) {
      query.action = action;
    }

    if (fromDate || toDate) {
      query.createdAt = {};

      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }

      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const activities = await Activity.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const formattedActivities = activities.map((activity) => ({
      _id: activity._id,

      staffId: activity.user?._id || null,

      staffName:
        activity.staffName ||
        activity.user?.name ||
        "Deleted Staff",

      staffEmail:
        activity.staffEmail ||
        activity.user?.email ||
        "",

      module: activity.module,
      action: activity.action,
      description: activity.description,

      recordId: activity.recordId,
      recordType: activity.recordType,

      referenceNumber: activity.referenceNumber,
      amount: activity.amount,

      date: activity.createdAt,

      metadata: activity.metadata,
    }));

    res.json({
      success: true,
      count: formattedActivities.length,
      activities: formattedActivities,
    });
  } catch (error) {
    console.error("Get staff activities error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch staff activities.",
    });
  }
};

// ======================================================
// GET STAFF ACTIVITY SUMMARY
// GET /api/staff/activity/summary
// ======================================================

const getStaffActivitySummary = async (req, res) => {
  try {
    const result = await Activity.aggregate([
      {
        $match: {
          module: {
            $in: [
              "Customer",
              "Supplier",
              "Product",
              "Sale",
              "Purchase",
              "Payment",
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },

          customerActivities: {
            $sum: {
              $cond: [{ $eq: ["$module", "Customer"] }, 1, 0],
            },
          },

          supplierActivities: {
            $sum: {
              $cond: [{ $eq: ["$module", "Supplier"] }, 1, 0],
            },
          },

          productActivities: {
            $sum: {
              $cond: [{ $eq: ["$module", "Product"] }, 1, 0],
            },
          },

          saleActivities: {
            $sum: {
              $cond: [{ $eq: ["$module", "Sale"] }, 1, 0],
            },
          },

          purchaseActivities: {
            $sum: {
              $cond: [{ $eq: ["$module", "Purchase"] }, 1, 0],
            },
          },

          paymentActivities: {
            $sum: {
              $cond: [{ $eq: ["$module", "Payment"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const summary = result[0] || {
      totalActivities: 0,
      customerActivities: 0,
      supplierActivities: 0,
      productActivities: 0,
      saleActivities: 0,
      purchaseActivities: 0,
      paymentActivities: 0,
    };

    delete summary._id;

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Staff activity summary error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch staff activity summary.",
    });
  }
};

module.exports = {
  getStaff,
  getStaffSummary,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffActivities,
  getStaffActivitySummary,
};