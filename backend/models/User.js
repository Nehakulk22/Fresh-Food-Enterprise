const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // System login role
    role: {
      type: String,
      enum: ["owner", "staff"],
      default: "staff",
    },

    // Staff employment information
    staffRole: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },

    joiningDate: {
      type: Date,
      default: null,
    },

    salary: {
      type: Number,
      min: 0,
      default: 0,
    },

    address: {
      type: String,
      default: "",
      trim: true,
      maxlength: 250,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    // Staff active/inactive status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Module permissions
    permissions: {
      dashboard: {
        type: Boolean,
        default: true,
      },

      customers: {
        type: Boolean,
        default: false,
      },

      suppliers: {
        type: Boolean,
        default: false,
      },

      products: {
        type: Boolean,
        default: false,
      },

      sales: {
        type: Boolean,
        default: false,
      },

      purchases: {
        type: Boolean,
        default: false,
      },

      payments: {
        type: Boolean,
        default: false,
      },

      expenses: {
        type: Boolean,
        default: false,
      },

      reports: {
        type: Boolean,
        default: false,
      },

      staff: {
        type: Boolean,
        default: false,
      },

      staffActivity: {
        type: Boolean,
        default: false,
      },

      settings: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);