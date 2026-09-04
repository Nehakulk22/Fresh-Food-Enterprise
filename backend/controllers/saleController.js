const Sale = require("../models/Sale");
const Product = require("../models/Product");


// ==========================================
// GET ALL SALES
// ==========================================

const getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("customer", "name phone")
      .populate("items.product", "name category unit")
      .sort({ saleDate: -1 });

    res.status(200).json({
      success: true,
      sales,
    });
  } catch (error) {
    console.error("Get sales error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sales",
      error: error.message,
    });
  }
};


// ==========================================
// GET SALE BY ID
// ==========================================

const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("customer", "name phone")
      .populate("items.product", "name category unit");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.status(200).json({
      success: true,
      sale,
    });
  } catch (error) {
    console.error("Get sale error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sale",
      error: error.message,
    });
  }
};


// ==========================================
// CREATE SALE
// ==========================================

const createSale = async (req, res) => {
  try {
    const {
      invoiceNumber,
      customer,
      saleDate,
      items,
      paidAmount,
      notes,
    } = req.body;


    // Required fields
    if (!invoiceNumber || !customer) {
      return res.status(400).json({
        success: false,
        message: "Invoice number and customer are required",
      });
    }


    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product is required",
      });
    }


    // Check invoice number
    const existingSale = await Sale.findOne({
      invoiceNumber: invoiceNumber.trim(),
    });

    if (existingSale) {
      return res.status(400).json({
        success: false,
        message: "Invoice number already exists",
      });
    }


    // Prepare sale items
    const saleItems = [];
    let totalAmount = 0;


    for (const item of items) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: "Product is required",
        });
      }

      const quantity = Number(item.quantity);
      const sellingPrice = Number(item.sellingPrice);


      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than zero",
        });
      }


      if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Selling price must be a valid number",
        });
      }


      // Find product
      const product = await Product.findOne({
        _id: item.product,
        isActive: true,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }


      // Check available stock
      if (Number(product.quantity) < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available stock: ${product.quantity}`,
        });
      }


      const itemTotal = quantity * sellingPrice;

      totalAmount += itemTotal;


      saleItems.push({
        product: item.product,
        quantity,
        sellingPrice,
        total: itemTotal,
      });
    }


    // Paid amount
    const paid = Number(paidAmount || 0);


    if (!Number.isFinite(paid) || paid < 0) {
      return res.status(400).json({
        success: false,
        message: "Paid amount must be a valid number",
      });
    }


    if (paid > totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot be greater than total amount",
      });
    }


    // IMPORTANT:
    // Pending Amount = Total Amount - Paid Amount
    const pendingAmount = totalAmount - paid;


    let paymentStatus = "Pending";

    if (pendingAmount === 0) {
      paymentStatus = "Paid";
    } else if (paid > 0) {
      paymentStatus = "Partial";
    }


    // Create sale
    const sale = await Sale.create({
      invoiceNumber: invoiceNumber.trim(),
      customer,
      saleDate: saleDate || new Date(),
      items: saleItems,
      totalAmount,
      paidAmount: paid,
      pendingAmount,
      paymentStatus,
      notes,
    });


    // Reduce product stock
    for (const item of saleItems) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            quantity: -item.quantity,
          },
        }
      );
    }


    const populatedSale = await Sale.findById(sale._id)
      .populate("customer", "name phone")
      .populate("items.product", "name category unit");


    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      sale: populatedSale,
    });

  } catch (error) {
    console.error("Create sale error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create sale",
      error: error.message,
    });
  }
};


// ==========================================
// DELETE SALE
// ==========================================

const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }


    // Restore stock
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            quantity: item.quantity,
          },
        }
      );
    }


    await Sale.findByIdAndDelete(req.params.id);


    res.status(200).json({
      success: true,
      message: "Sale deleted and stock restored successfully",
    });

  } catch (error) {
    console.error("Delete sale error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete sale",
      error: error.message,
    });
  }
};


module.exports = {
  getSales,
  getSaleById,
  createSale,
  deleteSale,
};