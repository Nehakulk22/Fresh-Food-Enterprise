
const Payment = require("../models/Payment");
const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");
const logActivity = require("../controllers/activityController");

// =====================================================
// MONEY HELPER
// =====================================================

const money = (value) => {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
};

// =====================================================
// GET RELATED DOCUMENT
// =====================================================

const getRelatedDocument = async (payment) => {
  if (payment.paymentType === "Customer") {
    if (!payment.sale) {
      throw new Error("Sale is required for customer payment");
    }

    const sale = await Sale.findById(payment.sale);

    if (!sale) {
      throw new Error("Related sale not found");
    }

    return sale;
  }

  if (payment.paymentType === "Supplier") {
    if (!payment.purchase) {
      throw new Error("Purchase is required for supplier payment");
    }

    const purchase = await Purchase.findById(payment.purchase);

    if (!purchase) {
      throw new Error("Related purchase not found");
    }

    return purchase;
  }

  throw new Error("Invalid payment type");
};

// =====================================================
// UPDATE FINANCIAL STATUS
// =====================================================

const updateFinancialStatus = async (document) => {
  const totalAmount = money(document.totalAmount);
  const paidAmount = money(document.paidAmount);

  const pendingAmount = money(totalAmount - paidAmount);

  document.pendingAmount = Math.max(0, pendingAmount);

  if (document.paidAmount >= document.totalAmount) {
    document.paidAmount = totalAmount;
    document.pendingAmount = 0;
    document.paymentStatus = "Paid";
  } else if (document.paidAmount > 0) {
    document.paymentStatus = "Partial";
  } else {
    document.paymentStatus = "Pending";
  }

  await document.save();
};

// =====================================================
// CREATE PAYMENT
// =====================================================

const createPayment = async (req, res) => {
  try {
    const {
      paymentType,
      customer,
      supplier,
      sale,
      purchase,
      amount,
      paymentMethod,
      paymentDate,
      transactionId,
      notes,
      status,
    } = req.body;

    // -------------------------------------------------
    // Validate payment type
    // -------------------------------------------------

    if (!["Customer", "Supplier"].includes(paymentType)) {
      return res.status(400).json({
        message: "Invalid payment type",
      });
    }

    // -------------------------------------------------
    // Validate amount
    // -------------------------------------------------

    const paymentAmount = money(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        message: "Enter a valid payment amount greater than 0",
      });
    }

    // -------------------------------------------------
    // Validate customer payment
    // -------------------------------------------------

    if (paymentType === "Customer") {
      if (!customer) {
        return res.status(400).json({
          message: "Customer is required",
        });
      }

      if (!sale) {
        return res.status(400).json({
          message: "Sale is required for customer payment",
        });
      }
    }

    // -------------------------------------------------
    // Validate supplier payment
    // -------------------------------------------------

    if (paymentType === "Supplier") {
      if (!supplier) {
        return res.status(400).json({
          message: "Supplier is required",
        });
      }

      if (!purchase) {
        return res.status(400).json({
          message: "Purchase is required for supplier payment",
        });
      }
    }

    // -------------------------------------------------
    // Validate payment status
    // -------------------------------------------------

    const paymentStatus = status || "Completed";

    if (!["Completed", "Pending", "Failed"].includes(paymentStatus)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    // -------------------------------------------------
    // Find related Sale/Purchase
    // -------------------------------------------------

    let relatedDocument;

    if (paymentType === "Customer") {
      relatedDocument = await Sale.findById(sale);
    } else {
      relatedDocument = await Purchase.findById(purchase);
    }

    if (!relatedDocument) {
      return res.status(404).json({
        message:
          paymentType === "Customer"
            ? "Related sale not found"
            : "Related purchase not found",
      });
    }

    // -------------------------------------------------
    // Validate customer/supplier relationship
    // -------------------------------------------------

    if (paymentType === "Customer") {
      if (
        relatedDocument.customer &&
        relatedDocument.customer.toString() !== customer.toString()
      ) {
        return res.status(400).json({
          message: "Selected customer does not belong to this sale",
        });
      }
    }

    if (paymentType === "Supplier") {
      if (
        relatedDocument.supplier &&
        relatedDocument.supplier.toString() !== supplier.toString()
      ) {
        return res.status(400).json({
          message: "Selected supplier does not belong to this purchase",
        });
      }
    }

    // -------------------------------------------------
    // Check remaining balance
    // -------------------------------------------------

    const totalAmount = money(relatedDocument.totalAmount);
    const currentPaid = money(relatedDocument.paidAmount || 0);
    const currentPending = money(totalAmount - currentPaid);

    // Pending / Failed payments do not change balances.

    if (paymentStatus === "Completed") {
      if (currentPending <= 0) {
        return res.status(400).json({
          message:
            paymentType === "Customer"
              ? "This sale is already fully paid"
              : "This purchase is already fully paid",
        });
      }

      if (paymentAmount > currentPending) {
        return res.status(400).json({
          message: `Payment exceeds the remaining balance. Remaining amount is ₹${currentPending.toFixed(
            2
          )}.`,
        });
      }
    }

    // -------------------------------------------------
    // Create Payment
    // -------------------------------------------------

    const payment = await Payment.create({
      paymentType,

      customer:
        paymentType === "Customer"
          ? customer
          : null,

      supplier:
        paymentType === "Supplier"
          ? supplier
          : null,

      sale:
        paymentType === "Customer"
          ? sale
          : null,

      purchase:
        paymentType === "Supplier"
          ? purchase
          : null,

      amount: paymentAmount,

      paymentMethod,

      paymentDate: paymentDate || new Date(),

      transactionId,

      notes,

      status: paymentStatus,
    });

    // -------------------------------------------------
    // Update Sale/Purchase ONLY for Completed payment
    // -------------------------------------------------

    if (paymentStatus === "Completed") {
      const newPaidAmount = money(
        currentPaid + paymentAmount
      );

      const newPendingAmount = money(
        totalAmount - newPaidAmount
      );

      relatedDocument.paidAmount = newPaidAmount;

      relatedDocument.pendingAmount = Math.max(
        0,
        newPendingAmount
      );

      if (relatedDocument.pendingAmount === 0) {
        relatedDocument.paymentStatus = "Paid";
      } else if (relatedDocument.paidAmount > 0) {
        relatedDocument.paymentStatus = "Partial";
      } else {
        relatedDocument.paymentStatus = "Pending";
      }

      await relatedDocument.save();
    }

    // -------------------------------------------------
    // STAFF ACTIVITY LOG
    // -------------------------------------------------

    const personName =
      paymentType === "Customer"
        ? "Customer"
        : "Supplier";

    const invoiceNumber =
      paymentType === "Customer"
        ? relatedDocument.invoiceNumber
        : relatedDocument.invoiceNumber;

    await logActivity({
      userId: req.user?._id,
      module: "Payment",
      action: "CREATE",
      description: `${paymentType} payment of ₹${paymentAmount.toFixed(
        2
      )} recorded for ${personName} - Invoice ${invoiceNumber}`,
      recordId: payment._id,
      recordType: "Payment",
      endpoint: req.originalUrl,
      method: req.method,
      ipAddress: req.ip,
      metadata: {
        paymentType,
        amount: paymentAmount,
        paymentMethod,
        status: paymentStatus,
        invoiceNumber,
        saleId: paymentType === "Customer" ? sale : null,
        purchaseId: paymentType === "Supplier" ? purchase : null,
      },
    });

    // -------------------------------------------------
    // Populate payment before response
    // -------------------------------------------------

    const populatedPayment = await Payment.findById(
      payment._id
    )
      .populate("customer", "name phone")
      .populate("supplier", "name phone")
      .populate("sale")
      .populate("purchase");

    res.status(201).json({
      message: "Payment recorded successfully",
      payment: populatedPayment,

      balance: {
        totalAmount: relatedDocument.totalAmount,
        paidAmount: relatedDocument.paidAmount,
        pendingAmount: relatedDocument.pendingAmount,
        paymentStatus: relatedDocument.paymentStatus,
      },
    });

  } catch (error) {
    console.error("Create payment error:", error);

    res.status(500).json({
      message: error.message || "Failed to create payment",
    });
  }
};

// =====================================================
// GET ALL PAYMENTS
// =====================================================

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("customer", "name phone")
      .populate("supplier", "name phone")
      .populate("sale")
      .populate("purchase")
      .sort({ paymentDate: -1 });

    res.status(200).json(payments);

  } catch (error) {
    console.error("Get payments error:", error);

    res.status(500).json({
      message:
        error.message || "Failed to fetch payments",
    });
  }
};

// =====================================================
// GET PAYMENT BY ID
// =====================================================

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("customer", "name phone")
      .populate("supplier", "name phone")
      .populate("sale")
      .populate("purchase");

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.status(200).json(payment);

  } catch (error) {
    console.error("Get payment error:", error);

    res.status(500).json({
      message:
        error.message || "Failed to fetch payment",
    });
  }
};

// =====================================================
// UPDATE PAYMENT
// =====================================================

const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // -------------------------------------------------
    // Save old values
    // -------------------------------------------------

    const oldAmount = money(payment.amount);
    const oldStatus = payment.status;

    // -------------------------------------------------
    // Editable fields
    // -------------------------------------------------

    if (req.body.amount !== undefined) {
      const newAmount = money(req.body.amount);

      if (!Number.isFinite(newAmount) || newAmount <= 0) {
        return res.status(400).json({
          message: "Payment amount must be greater than 0",
        });
      }

      payment.amount = newAmount;
    }

    if (req.body.paymentMethod !== undefined) {
      payment.paymentMethod = req.body.paymentMethod;
    }

    if (req.body.paymentDate !== undefined) {
      payment.paymentDate = req.body.paymentDate;
    }

    if (req.body.transactionId !== undefined) {
      payment.transactionId = req.body.transactionId;
    }

    if (req.body.notes !== undefined) {
      payment.notes = req.body.notes;
    }

    if (req.body.status !== undefined) {
      payment.status = req.body.status;
    }

    if (
      !["Completed", "Pending", "Failed"].includes(
        payment.status
      )
    ) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    // -------------------------------------------------
    // Find related document
    // -------------------------------------------------

    const relatedDocument =
      await getRelatedDocument(payment);

    const totalAmount = money(
      relatedDocument.totalAmount
    );

    let currentPaid = money(
      relatedDocument.paidAmount || 0
    );

    // -------------------------------------------------
    // Remove old completed payment effect
    // -------------------------------------------------

    if (oldStatus === "Completed") {
      currentPaid = money(
        currentPaid - oldAmount
      );
    }

    if (currentPaid < 0) {
      currentPaid = 0;
    }

    // -------------------------------------------------
    // Apply new completed payment
    // -------------------------------------------------

    if (payment.status === "Completed") {
      const newAmount = money(payment.amount);

      const remainingAmount = money(
        totalAmount - currentPaid
      );

      if (newAmount > remainingAmount) {
        return res.status(400).json({
          message: `Payment exceeds the remaining balance. Maximum allowed is ₹${remainingAmount.toFixed(
            2
          )}.`,
        });
      }

      currentPaid = money(
        currentPaid + newAmount
      );
    }

    // -------------------------------------------------
    // Update payment
    // -------------------------------------------------

    await payment.save();

    // -------------------------------------------------
    // Update Sale/Purchase
    // -------------------------------------------------

    relatedDocument.paidAmount = currentPaid;

    relatedDocument.pendingAmount = Math.max(
      0,
      money(totalAmount - currentPaid)
    );

    if (relatedDocument.pendingAmount === 0) {
      relatedDocument.paymentStatus = "Paid";
    } else if (relatedDocument.paidAmount > 0) {
      relatedDocument.paymentStatus = "Partial";
    } else {
      relatedDocument.paymentStatus = "Pending";
    }

    await relatedDocument.save();

    // -------------------------------------------------
    // STAFF ACTIVITY LOG
    // -------------------------------------------------

    await logActivity({
      userId: req.user?._id,
      module: "Payment",
      action: "UPDATE",
      description: `${payment.paymentType} payment updated - ₹${money(
        payment.amount
      ).toFixed(2)} - Invoice ${relatedDocument.invoiceNumber}`,
      recordId: payment._id,
      recordType: "Payment",
      endpoint: req.originalUrl,
      method: req.method,
      ipAddress: req.ip,
      metadata: {
        paymentType: payment.paymentType,
        oldAmount,
        newAmount: money(payment.amount),
        oldStatus,
        newStatus: payment.status,
        paymentMethod: payment.paymentMethod,
        invoiceNumber: relatedDocument.invoiceNumber,
      },
    });

    // -------------------------------------------------
    // Populate updated payment
    // -------------------------------------------------

    const updatedPayment = await Payment.findById(
      payment._id
    )
      .populate("customer", "name phone")
      .populate("supplier", "name phone")
      .populate("sale")
      .populate("purchase");

    res.status(200).json({
      message: "Payment updated successfully",
      payment: updatedPayment,

      balance: {
        totalAmount: relatedDocument.totalAmount,
        paidAmount: relatedDocument.paidAmount,
        pendingAmount: relatedDocument.pendingAmount,
        paymentStatus: relatedDocument.paymentStatus,
      },
    });

  } catch (error) {
    console.error("Update payment error:", error);

    res.status(500).json({
      message:
        error.message || "Failed to update payment",
    });
  }
};

// =====================================================
// DELETE PAYMENT
// =====================================================

const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(
      req.params.id
    );

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // -------------------------------------------------
    // Get related Sale/Purchase
    // -------------------------------------------------

    const relatedDocument =
      await getRelatedDocument(payment);

    const invoiceNumber =
      relatedDocument.invoiceNumber;

    const paymentAmount = money(
      payment.amount
    );

    const paymentType =
      payment.paymentType;

    // -------------------------------------------------
    // Reverse completed payment
    // -------------------------------------------------

    if (payment.status === "Completed") {
      const currentPaid = money(
        relatedDocument.paidAmount || 0
      );

      const newPaidAmount = Math.max(
        0,
        money(currentPaid - paymentAmount)
      );

      relatedDocument.paidAmount =
        newPaidAmount;

      relatedDocument.pendingAmount =
        money(
          relatedDocument.totalAmount -
            newPaidAmount
        );

      if (
        relatedDocument.pendingAmount === 0
      ) {
        relatedDocument.paymentStatus =
          "Paid";
      } else if (
        relatedDocument.paidAmount > 0
      ) {
        relatedDocument.paymentStatus =
          "Partial";
      } else {
        relatedDocument.paymentStatus =
          "Pending";
      }

      await relatedDocument.save();
    }

    // -------------------------------------------------
    // Delete payment
    // -------------------------------------------------

    await Payment.findByIdAndDelete(
      payment._id
    );

    // -------------------------------------------------
    // STAFF ACTIVITY LOG
    // -------------------------------------------------

    await logActivity({
      userId: req.user?._id,
      module: "Payment",
      action: "DELETE",
      description: `${paymentType} payment of ₹${paymentAmount.toFixed(
        2
      )} deleted - Invoice ${invoiceNumber}`,
      recordId: payment._id,
      recordType: "Payment",
      endpoint: req.originalUrl,
      method: req.method,
      ipAddress: req.ip,
      metadata: {
        paymentType,
        amount: paymentAmount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        invoiceNumber,
      },
    });

    res.status(200).json({
      message: "Payment deleted successfully",

      balance: {
        totalAmount:
          relatedDocument.totalAmount,

        paidAmount:
          relatedDocument.paidAmount,

        pendingAmount:
          relatedDocument.pendingAmount,

        paymentStatus:
          relatedDocument.paymentStatus,
      },
    });

  } catch (error) {
    console.error("Delete payment error:", error);

    res.status(500).json({
      message:
        error.message ||
        "Failed to delete payment",
    });
  }
};

// =====================================================
// PAYMENT SUMMARY
// =====================================================

const getPaymentSummary = async (req, res) => {
  try {
    const summary = await Payment.aggregate([
      {
        $match: {
          status: "Completed",
        },
      },

      {
        $group: {
          _id: "$paymentType",

          total: {
            $sum: "$amount",
          },

          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const customer = summary.find(
      (item) => item._id === "Customer"
    );

    const supplier = summary.find(
      (item) => item._id === "Supplier"
    );

    res.status(200).json({
      totalReceived: money(
        customer?.total || 0
      ),

      totalPaid: money(
        supplier?.total || 0
      ),

      customerTransactions:
        customer?.count || 0,

      supplierTransactions:
        supplier?.count || 0,
    });

  } catch (error) {
    console.error(
      "Payment summary error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to fetch payment summary",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentSummary,
};
