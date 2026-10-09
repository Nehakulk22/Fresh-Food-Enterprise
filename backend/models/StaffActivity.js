const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    // Staff/owner who performed the activity
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Store name separately so activity history remains understandable
    // even if the user account is later removed.
    staffName: {
      type: String,
      required: true,
      trim: true,
    },

    staffEmail: {
      type: String,
      default: "",
      trim: true,
    },

    // Business module
    module: {
      type: String,
      enum: [
        "Customer",
        "Supplier",
        "Product",
        "Sale",
        "Purchase",
        "Payment",
      ],
      required: true,
    },

    // Business action
    action: {
      type: String,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
      ],
      required: true,
    },

    // Human-readable description
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Related document ID
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Example:
    // Customer, Supplier, Product, Sale, Purchase, Payment
    recordType: {
      type: String,
      default: "",
      trim: true,
    },

    // Invoice number where applicable
    invoiceNumber: {
      type: String,
      default: "",
      trim: true,
    },

    // Amount where applicable
    amount: {
      type: Number,
      default: null,
      min: 0,
    },

    // API information
    endpoint: {
      type: String,
      default: "",
      trim: true,
    },

    method: {
      type: String,
      default: "",
      trim: true,
    },

    // Additional business information
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Activity", activitySchema);