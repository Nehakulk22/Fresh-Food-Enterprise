const Settings = require("../models/Settings");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ======================================================
// GET SETTINGS
// ======================================================

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        businessName: "FreshLedger",
        currency: "INR",
        dateFormat: "DD/MM/YYYY",
      });
    }

    const user = await User.findById(req.user._id).select(
      "-password"
    );

    return res.status(200).json({
      success: true,
      settings,
      user,
    });
  } catch (error) {
    console.error("Get settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load settings.",
    });
  }
};

// ======================================================
// UPDATE BUSINESS SETTINGS
// ======================================================

const updateBusinessSettings = async (req, res) => {
  try {
    const {
      businessName,
      businessEmail,
      businessPhone,
      businessAddress,
      currency,
      dateFormat,
      lowStockAlerts,
      paymentNotifications,
    } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    settings.businessName =
      businessName !== undefined
        ? businessName.trim()
        : settings.businessName;

    settings.businessEmail =
      businessEmail !== undefined
        ? businessEmail.trim().toLowerCase()
        : settings.businessEmail;

    settings.businessPhone =
      businessPhone !== undefined
        ? businessPhone.trim()
        : settings.businessPhone;

    settings.businessAddress =
      businessAddress !== undefined
        ? businessAddress.trim()
        : settings.businessAddress;

    if (currency !== undefined) {
      settings.currency = currency;
    }

    if (dateFormat !== undefined) {
      settings.dateFormat = dateFormat;
    }

    if (lowStockAlerts !== undefined) {
      settings.lowStockAlerts =
        Boolean(lowStockAlerts);
    }

    if (paymentNotifications !== undefined) {
      settings.paymentNotifications =
        Boolean(paymentNotifications);
    }

    settings.updatedBy = req.user._id;

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Business settings updated successfully.",
      settings,
    });
  } catch (error) {
    console.error(
      "Update business settings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update business settings.",
    });
  }
};

// ======================================================
// UPDATE ACCOUNT PROFILE
// ======================================================

const updateAccountProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "This email address is already in use.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.name = name.trim();
    user.email = email.trim().toLowerCase();
    user.phone = phone
      ? phone.trim()
      : "";
    user.address = address
      ? address.trim()
      : "";

    await user.save();

    const updatedUser =
      await User.findById(user._id).select(
        "-password"
      );

    return res.status(200).json({
      success: true,
      message: "Account profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "Update account profile error:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email address is already in use.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update account profile.",
    });
  }
};

// ======================================================
// CHANGE PASSWORD
// ======================================================

const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all password fields.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must contain at least 6 characters.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match.",
      });
    }

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect.",
      });
    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
      newPassword,
      salt
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully. Please login again.",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
    });
  }
};

module.exports = {
  getSettings,
  updateBusinessSettings,
  updateAccountProfile,
  changePassword,
};