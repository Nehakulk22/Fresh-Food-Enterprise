const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    items: {
      type: [purchaseItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "Purchase must contain at least one product",
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["Paid", "Partial", "Pending"],
      default: "Pending",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Purchase", purchaseSchema);