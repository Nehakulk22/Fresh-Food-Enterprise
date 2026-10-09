const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");
const Payment = require("../models/Payment");
const Product = require("../models/Product");


// =====================================================
// MONEY HELPER
// =====================================================

const money = (value) => {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
};


// =====================================================
// DATE FILTER HELPER
// =====================================================

const getDateFilter = (fromDate, toDate, fieldName) => {
  const filter = {};

  if (!fromDate && !toDate) {
    return filter;
  }

  filter[fieldName] = {};

  if (fromDate) {
    const startDate = new Date(fromDate);

    startDate.setHours(0, 0, 0, 0);

    filter[fieldName].$gte = startDate;
  }

  if (toDate) {
    const endDate = new Date(toDate);

    endDate.setHours(23, 59, 59, 999);

    filter[fieldName].$lte = endDate;
  }

  return filter;
};


// =====================================================
// GET REPORT SUMMARY
// =====================================================

const getReportSummary = async (req, res) => {
  try {
    const {
      fromDate,
      toDate,
    } = req.query;


    // -------------------------------------------------
    // SALES
    // -------------------------------------------------

    const salesFilter = getDateFilter(
      fromDate,
      toDate,
      "saleDate"
    );


    const sales = await Sale.find(
      salesFilter
    );


    let totalSalesAmount = 0;
    let totalSalesPaid = 0;
    let totalSalesPending = 0;


    sales.forEach((sale) => {
      totalSalesAmount += Number(
        sale.totalAmount || 0
      );

      totalSalesPaid += Number(
        sale.paidAmount || 0
      );

      totalSalesPending += Number(
        sale.pendingAmount || 0
      );
    });


    // -------------------------------------------------
    // PURCHASES
    // -------------------------------------------------

    const purchasesFilter = getDateFilter(
      fromDate,
      toDate,
      "purchaseDate"
    );


    const purchases = await Purchase.find(
      purchasesFilter
    );


    let totalPurchaseAmount = 0;
    let totalPurchasePaid = 0;
    let totalPurchasePending = 0;


    purchases.forEach((purchase) => {
      totalPurchaseAmount += Number(
        purchase.totalAmount || 0
      );

      totalPurchasePaid += Number(
        purchase.paidAmount || 0
      );

      totalPurchasePending += Number(
        purchase.pendingAmount || 0
      );
    });


    // -------------------------------------------------
    // PAYMENTS
    // -------------------------------------------------

    const paymentsFilter = getDateFilter(
      fromDate,
      toDate,
      "paymentDate"
    );


    paymentsFilter.status = "Completed";


    const payments = await Payment.find(
      paymentsFilter
    );


    let totalReceived = 0;
    let totalPaid = 0;

    let customerPaymentCount = 0;
    let supplierPaymentCount = 0;


    payments.forEach((payment) => {

      const amount = Number(
        payment.amount || 0
      );


      if (payment.paymentType === "Customer") {
        totalReceived += amount;
        customerPaymentCount++;
      }


      if (payment.paymentType === "Supplier") {
        totalPaid += amount;
        supplierPaymentCount++;
      }

    });


    // -------------------------------------------------
    // PRODUCTS / INVENTORY
    // -------------------------------------------------

    const products = await Product.find({
      isActive: true,
    });


    const totalProducts = products.length;


    let totalStockQuantity = 0;
    let lowStockProducts = 0;


    products.forEach((product) => {

      const quantity = Number(
        product.quantity || 0
      );


      totalStockQuantity += quantity;


      // Low stock threshold
      // Change this value if your project uses
      // another minimum stock level.

      if (quantity <= 10) {
        lowStockProducts++;
      }

    });


    // -------------------------------------------------
    // FINAL RESPONSE
    // -------------------------------------------------

    res.status(200).json({

      success: true,

      filters: {
        fromDate: fromDate || null,
        toDate: toDate || null,
      },


      sales: {
        count: sales.length,

        totalAmount: money(
          totalSalesAmount
        ),

        paidAmount: money(
          totalSalesPaid
        ),

        pendingAmount: money(
          totalSalesPending
        ),
      },


      purchases: {
        count: purchases.length,

        totalAmount: money(
          totalPurchaseAmount
        ),

        paidAmount: money(
          totalPurchasePaid
        ),

        pendingAmount: money(
          totalPurchasePending
        ),
      },


      payments: {
        totalReceived: money(
          totalReceived
        ),

        totalPaid: money(
          totalPaid
        ),

        customerTransactions:
          customerPaymentCount,

        supplierTransactions:
          supplierPaymentCount,
      },


      inventory: {
        totalProducts,

        totalStockQuantity,

        lowStockProducts,
      },


      financial: {
        salesAmount: money(
          totalSalesAmount
        ),

        purchaseAmount: money(
          totalPurchaseAmount
        ),

        moneyReceived: money(
          totalReceived
        ),

        moneyPaid: money(
          totalPaid
        ),

        customerPending: money(
          totalSalesPending
        ),

        supplierPending: money(
          totalPurchasePending
        ),
      },

    });

  } catch (error) {

    console.error(
      "Report summary error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to generate report",
    });
  }
};


// =====================================================
// GET SALES REPORT
// =====================================================

const getSalesReport = async (req, res) => {
  try {

    const {
      fromDate,
      toDate,
    } = req.query;


    const filter = getDateFilter(
      fromDate,
      toDate,
      "saleDate"
    );


    const sales = await Sale.find(filter)
      .populate(
        "customer",
        "name phone"
      )
      .populate(
        "items.product",
        "name unit"
      )
      .sort({
        saleDate: -1,
      });


    const report = sales.map((sale) => ({
      _id: sale._id,

      invoiceNumber:
        sale.invoiceNumber,

      customer:
        sale.customer?.name ||
        "Unknown",

      saleDate:
        sale.saleDate,

      totalAmount:
        money(sale.totalAmount),

      paidAmount:
        money(sale.paidAmount),

      pendingAmount:
        money(sale.pendingAmount),

      paymentStatus:
        sale.paymentStatus,

      items:
        sale.items,
    }));


    res.status(200).json({
      success: true,
      count: report.length,
      sales: report,
    });

  } catch (error) {

    console.error(
      "Sales report error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to generate sales report",
    });
  }
};


// =====================================================
// GET PURCHASE REPORT
// =====================================================

const getPurchaseReport = async (req, res) => {
  try {

    const {
      fromDate,
      toDate,
    } = req.query;


    const filter = getDateFilter(
      fromDate,
      toDate,
      "purchaseDate"
    );


    const purchases =
      await Purchase.find(filter)
        .populate(
          "supplier",
          "name phone"
        )
        .populate(
          "items.product",
          "name unit"
        )
        .sort({
          purchaseDate: -1,
        });


    const report = purchases.map(
      (purchase) => ({
        _id: purchase._id,

        invoiceNumber:
          purchase.invoiceNumber,

        supplier:
          purchase.supplier?.name ||
          "Unknown",

        purchaseDate:
          purchase.purchaseDate,

        totalAmount:
          money(
            purchase.totalAmount
          ),

        paidAmount:
          money(
            purchase.paidAmount
          ),

        pendingAmount:
          money(
            purchase.pendingAmount
          ),

        paymentStatus:
          purchase.paymentStatus,

        items:
          purchase.items,
      })
    );


    res.status(200).json({
      success: true,
      count: report.length,
      purchases: report,
    });

  } catch (error) {

    console.error(
      "Purchase report error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to generate purchase report",
    });
  }
};


// =====================================================
// GET PAYMENT REPORT
// =====================================================

const getPaymentReport = async (req, res) => {
  try {

    const {
      fromDate,
      toDate,
    } = req.query;


    const filter = getDateFilter(
      fromDate,
      toDate,
      "paymentDate"
    );


    const payments =
      await Payment.find({
        ...filter,
        status: "Completed",
      })
        .populate(
          "customer",
          "name phone"
        )
        .populate(
          "supplier",
          "name phone"
        )
        .populate(
          "sale",
          "invoiceNumber"
        )
        .populate(
          "purchase",
          "invoiceNumber"
        )
        .sort({
          paymentDate: -1,
        });


    const report = payments.map(
      (payment) => ({
        _id: payment._id,

        paymentType:
          payment.paymentType,

        person:
          payment.paymentType ===
          "Customer"
            ? payment.customer?.name ||
              "Unknown"
            : payment.supplier?.name ||
              "Unknown",

        invoiceNumber:
          payment.paymentType ===
          "Customer"
            ? payment.sale?.invoiceNumber ||
              "-"
            : payment.purchase?.invoiceNumber ||
              "-",

        amount:
          money(payment.amount),

        paymentMethod:
          payment.paymentMethod,

        paymentDate:
          payment.paymentDate,

        transactionId:
          payment.transactionId ||
          "-",

        status:
          payment.status,
      })
    );


    res.status(200).json({
      success: true,
      count: report.length,
      payments: report,
    });

  } catch (error) {

    console.error(
      "Payment report error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to generate payment report",
    });
  }
};


// =====================================================
// GET INVENTORY REPORT
// =====================================================

const getInventoryReport = async (
  req,
  res
) => {
  try {

    const products = await Product.find({
      isActive: true,
    })
      .sort({
        quantity: 1,
      });


    const report = products.map(
      (product) => ({
        _id: product._id,

        name:
          product.name,

        category:
          product.category,

        unit:
          product.unit,

        quantity:
          Number(product.quantity || 0),

        price:
          money(product.price || 0),

        stockStatus:
          Number(product.quantity || 0) <= 10
            ? "Low Stock"
            : "Available",
      })
    );


    res.status(200).json({
      success: true,
      count: report.length,
      products: report,
    });

  } catch (error) {

    console.error(
      "Inventory report error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to generate inventory report",
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getReportSummary,
  getSalesReport,
  getPurchaseReport,
  getPaymentReport,
  getInventoryReport,
};