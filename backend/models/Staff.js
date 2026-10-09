const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Staff name is required"],
      trim: true,
      minlength: [2, "Staff name must contain at least 2 characters"],
      maxlength: [100, "Staff name cannot exceed 100 characters"],
    },

    role: {
      type: String,
      required: [true, "Staff role is required"],
      trim: true,
      minlength: [2, "Staff role must contain at least 2 characters"],
      maxlength: [50, "Staff role cannot exceed 50 characters"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      unique: true,
      match: [
        /^[6-9]\d{9}$/,
        "Please enter a valid 10-digit Indian mobile number",
      ],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },

    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
    },

    status: {
      type: String,
      enum: {
        values: ["Active", "Inactive"],
        message: "Status must be Active or Inactive",
      },
      default: "Active",
    },

    address: {
      type: String,
      trim: true,
      maxlength: [250, "Address cannot exceed 250 characters"],
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Staff", staffSchema);