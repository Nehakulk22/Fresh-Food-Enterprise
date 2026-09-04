const Purchase = require("../models/Purchase");
const Product = require("../models/Product");

// Get all purchases
const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("supplier", "name phone")
      .populate("items.product", "name unit")
      .sort({ purchaseDate: -1 });

    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch purchases",
      error: error.message,
    });
  }
};

// Get single purchase
const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate("supplier", "name phone")
      .populate("items.product", "name unit");

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    res.status(200).json(purchase);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch purchase",
      error: error.message,
    });
  }
};

// Create purchase
const createPurchase = async (req, res) => {
  try {
    const {
      invoiceNumber,
      supplier,
      purchaseDate,
      items,
      paidAmount,
      notes,
    } = req.body;

    if (!invoiceNumber || !supplier || !purchaseDate || !items?.length) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const existingPurchase = await Purchase.findOne({
      invoiceNumber: invoiceNumber.trim(),
    });

    if (existingPurchase) {
      return res.status(400).json({
        message: "Invoice number already exists",
      });
    }

    let totalAmount = 0;

    const processedItems = [];

    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          message: "Invalid product quantity",
        });
      }

      if (
        item.purchasePrice === undefined ||
        Number(item.purchasePrice) < 0
      ) {
        return res.status(400).json({
          message: "Invalid purchase price",
        });
      }

      const product = await Product.findOne({
        _id: item.product,
        isActive: true,
      });

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      const itemTotal =
        Number(item.quantity) * Number(item.purchasePrice);

      totalAmount += itemTotal;

      processedItems.push({
        product: item.product,
        quantity: Number(item.quantity),
        purchasePrice: Number(item.purchasePrice),
        total: itemTotal,
      });
    }

    const paid = Number(paidAmount || 0);

    if (paid < 0) {
      return res.status(400).json({
        message: "Paid amount cannot be negative",
      });
    }

    if (paid > totalAmount) {
      return res.status(400).json({
        message: "Paid amount cannot be greater than total amount",
      });
    }

    // Pending amount = Total Amount - Paid Amount
    const pendingAmount = totalAmount - paid;

    let paymentStatus = "Pending";

    if (pendingAmount === 0) {
      paymentStatus = "Paid";
    } else if (paid > 0) {
      paymentStatus = "Partial";
    }

    const purchase = await Purchase.create({
      invoiceNumber: invoiceNumber.trim(),
      supplier,
      purchaseDate,
      items: processedItems,
      totalAmount,
      paidAmount: paid,
      pendingAmount,
      paymentStatus,
      notes,
    });

    // Increase product stock
    for (const item of processedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          quantity: item.quantity,
        },
      });
    }

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate("supplier", "name phone")
      .populate("items.product", "name unit");

    res.status(201).json({
      message: "Purchase created successfully",
      purchase: populatedPurchase,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create purchase",
      error: error.message,
    });
  }
};

// Delete purchase
const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    // Reverse stock when purchase is deleted
    for (const item of purchase.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          quantity: -item.quantity,
        },
      });
    }

    await Purchase.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Purchase deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete purchase",
      error: error.message,
    });
  }
};

module.exports = {
  getPurchases,
  getPurchaseById,
  createPurchase,
  deletePurchase,
};