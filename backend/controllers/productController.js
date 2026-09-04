const Product = require("../models/Product");

// Get all active products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("supplier", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("supplier", "name");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      quantity,
      lowStockThreshold,
      supplier,
      notes,
    } = req.body;

    if (
      !name ||
      !category ||
      !unit ||
      purchasePrice === undefined ||
      sellingPrice === undefined
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    if (Number(purchasePrice) < 0 || Number(sellingPrice) < 0) {
      return res.status(400).json({
        message: "Prices cannot be negative",
      });
    }

    if (Number(quantity || 0) < 0) {
      return res.status(400).json({
        message: "Quantity cannot be negative",
      });
    }

    const product = await Product.create({
      name,
      category,
      unit,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      quantity: Number(quantity || 0),
      lowStockThreshold: Number(lowStockThreshold || 5),
      supplier: supplier || null,
      notes,
    });

    const populatedProduct = await Product.findById(product._id).populate(
      "supplier",
      "name"
    );

    res.status(201).json({
      message: "Product created successfully",
      product: populatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      quantity,
      lowStockThreshold,
      supplier,
      notes,
    } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (purchasePrice !== undefined && Number(purchasePrice) < 0) {
      return res.status(400).json({
        message: "Purchase price cannot be negative",
      });
    }

    if (sellingPrice !== undefined && Number(sellingPrice) < 0) {
      return res.status(400).json({
        message: "Selling price cannot be negative",
      });
    }

    if (quantity !== undefined && Number(quantity) < 0) {
      return res.status(400).json({
        message: "Quantity cannot be negative",
      });
    }

    product.name = name ?? product.name;
    product.category = category ?? product.category;
    product.unit = unit ?? product.unit;
    product.purchasePrice =
      purchasePrice !== undefined
        ? Number(purchasePrice)
        : product.purchasePrice;
    product.sellingPrice =
      sellingPrice !== undefined
        ? Number(sellingPrice)
        : product.sellingPrice;
    product.quantity =
      quantity !== undefined ? Number(quantity) : product.quantity;
    product.lowStockThreshold =
      lowStockThreshold !== undefined
        ? Number(lowStockThreshold)
        : product.lowStockThreshold;
    product.supplier =
      supplier !== undefined ? supplier || null : product.supplier;
    product.notes = notes ?? product.notes;

    await product.save();

    const updatedProduct = await Product.findById(product._id).populate(
      "supplier",
      "name"
    );

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Delete product (soft delete)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};