const Supplier = require("../models/Supplier");

// GET ALL SUPPLIERS
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(suppliers);
  } catch (error) {
    console.error("Get suppliers error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET SINGLE SUPPLIER
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(
      req.params.id
    );

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    res.status(200).json(supplier);
  } catch (error) {
    console.error("Get supplier error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// CREATE SUPPLIER
const createSupplier = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      openingBalance,
      notes,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Supplier name and phone are required",
      });
    }

    const supplier = await Supplier.create({
      name,
      phone,
      email,
      address,
      openingBalance: openingBalance || 0,
      notes,
    });

    res.status(201).json({
      message: "Supplier created successfully",
      supplier,
    });
  } catch (error) {
    console.error("Create supplier error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// UPDATE SUPPLIER
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(
      req.params.id
    );

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    const {
      name,
      phone,
      email,
      address,
      openingBalance,
      notes,
    } = req.body;

    supplier.name = name ?? supplier.name;
    supplier.phone = phone ?? supplier.phone;
    supplier.email = email ?? supplier.email;
    supplier.address = address ?? supplier.address;
    supplier.openingBalance =
      openingBalance ?? supplier.openingBalance;
    supplier.notes = notes ?? supplier.notes;

    await supplier.save();

    res.status(200).json({
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (error) {
    console.error("Update supplier error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// DELETE SUPPLIER
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(
      req.params.id
    );

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    supplier.isActive = false;

    await supplier.save();

    res.status(200).json({
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error("Delete supplier error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};