import React, { useEffect, useState } from "react";
import "./Reports.css";

const API_URL = "http://localhost:8000/api";

function Reports() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [summary, setSummary] = useState(null);

  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [activeReport, setActiveReport] = useState("overview");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // BUILD DATE QUERY
  // =====================================================

  const getDateQuery = () => {
    const params = new URLSearchParams();

    if (fromDate) {
      params.append("fromDate", fromDate);
    }

    if (toDate) {
      params.append("toDate", toDate);
    }

    const query = params.toString();

    return query ? `?${query}` : "";
  };

  // =====================================================
  // FETCH REPORTS
  // =====================================================

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const query = getDateQuery();

      // Summary
      const summaryResponse = await fetch(
        `${API_URL}/reports/summary${query}`
      );

      if (!summaryResponse.ok) {
        throw new Error("Failed to fetch report summary");
      }

      const summaryData = await summaryResponse.json();

      // Sales
      const salesResponse = await fetch(
        `${API_URL}/reports/sales${query}`
      );

      if (!salesResponse.ok) {
        throw new Error("Failed to fetch sales report");
      }

      const salesData = await salesResponse.json();

      // Purchases
      const purchasesResponse = await fetch(
        `${API_URL}/reports/purchases${query}`
      );

      if (!purchasesResponse.ok) {
        throw new Error("Failed to fetch purchase report");
      }

      const purchasesData = await purchasesResponse.json();

      // Payments
      const paymentsResponse = await fetch(
        `${API_URL}/reports/payments${query}`
      );

      if (!paymentsResponse.ok) {
        throw new Error("Failed to fetch payment report");
      }

      const paymentsData = await paymentsResponse.json();

      // Inventory
      const inventoryResponse = await fetch(
        `${API_URL}/reports/inventory`
      );

      if (!inventoryResponse.ok) {
        throw new Error("Failed to fetch inventory report");
      }

      const inventoryData = await inventoryResponse.json();

      setSummary(summaryData);

      setSales(
        Array.isArray(salesData.sales)
          ? salesData.sales
          : []
      );

      setPurchases(
        Array.isArray(purchasesData.purchases)
          ? purchasesData.purchases
          : []
      );

      setPayments(
        Array.isArray(paymentsData.payments)
          ? paymentsData.payments
          : []
      );

      setInventory(
        Array.isArray(inventoryData.products)
          ? inventoryData.products
          : []
      );
    } catch (error) {
      console.error("Reports error:", error);

      setError(
        error.message || "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchReports();
  }, []);

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // CLEAR FILTER
  // =====================================================

 const clearFilter = async () => {
  setFromDate("");
  setToDate("");

  try {
    setLoading(true);
    setError("");

    const [
      summaryResponse,
      salesResponse,
      purchasesResponse,
      paymentsResponse,
      inventoryResponse,
    ] = await Promise.all([
      fetch(`${API_URL}/reports/summary`),
      fetch(`${API_URL}/reports/sales`),
      fetch(`${API_URL}/reports/purchases`),
      fetch(`${API_URL}/reports/payments`),
      fetch(`${API_URL}/reports/inventory`),
    ]);

    if (
      !summaryResponse.ok ||
      !salesResponse.ok ||
      !purchasesResponse.ok ||
      !paymentsResponse.ok ||
      !inventoryResponse.ok
    ) {
      throw new Error("Failed to clear report filters");
    }

    const summaryData = await summaryResponse.json();
    const salesData = await salesResponse.json();
    const purchasesData = await purchasesResponse.json();
    const paymentsData = await paymentsResponse.json();
    const inventoryData = await inventoryResponse.json();

    setSummary(summaryData);

    setSales(
      Array.isArray(salesData.sales)
        ? salesData.sales
        : []
    );

    setPurchases(
      Array.isArray(purchasesData.purchases)
        ? purchasesData.purchases
        : []
    );

    setPayments(
      Array.isArray(paymentsData.payments)
        ? paymentsData.payments
        : []
    );

    setInventory(
      Array.isArray(inventoryData.products)
        ? inventoryData.products
        : []
    );
  } catch (error) {
    console.error("Clear filter error:", error);
    setError(error.message || "Failed to reload reports");
  } finally {
    setLoading(false);
  }
};

  // =====================================================
  // PRINT REPORT
  // =====================================================

  const handlePrint = () => {
    window.print();
  };

  // =====================================================
  // PRINT REPORT TITLE
  // =====================================================

  const getReportTitle = () => {
    switch (activeReport) {
      case "sales":
        return "Sales Report";

      case "purchases":
        return "Purchase Report";

      case "payments":
        return "Payment Report";

      case "inventory":
        return "Inventory Report";

      default:
        return "Business Overview";
    }
  };

  // =====================================================
  // PRINT DATE RANGE
  // =====================================================

  const getPrintDateRange = () => {
    if (fromDate && toDate) {
      return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
    }

    if (fromDate) {
      return `From ${formatDate(fromDate)}`;
    }

    if (toDate) {
      return `Up to ${formatDate(toDate)}`;
    }

    return "All Dates";
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="reports-page">

      {/* =================================================
          SCREEN HEADER
          NOT PRINTED
      ================================================= */}

      <div className="reports-header no-print">

        <div>
          <h1>Reports</h1>

          <p>
            View sales, purchases, payments and
            inventory reports.
          </p>
        </div>

        <button
          className="reports-print-btn no-print"
          onClick={handlePrint}
        >
          🖨 Print Report
        </button>

      </div>


      {/* =================================================
          ERROR
          NOT PRINTED
      ================================================= */}

      {error && (
        <div className="reports-error no-print">
          {error}
        </div>
      )}


      {/* =================================================
          DATE FILTER
          NOT PRINTED
      ================================================= */}

      <div className="reports-filter no-print">

        <div className="filter-group">

          <label>
            From Date
          </label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) =>
              setFromDate(e.target.value)
            }
          />

        </div>


        <div className="filter-group">

          <label>
            To Date
          </label>

          <input
            type="date"
            value={toDate}
            onChange={(e) =>
              setToDate(e.target.value)
            }
          />

        </div>


        <button
          className="generate-report-btn no-print"
          onClick={fetchReports}
          disabled={loading}
        >
          {loading
            ? "Generating..."
            : "Generate Report"}
        </button>


        <button
          className="clear-report-btn no-print"
          onClick={clearFilter}
        >
          Clear
        </button>

      </div>


      {/* =================================================
          REPORT NAVIGATION
          NOT PRINTED
      ================================================= */}

      <div className="report-tabs no-print">

        <button
          className={
            activeReport === "overview"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveReport("overview")
          }
        >
          Overview
        </button>


        <button
          className={
            activeReport === "sales"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveReport("sales")
          }
        >
          Sales
        </button>


        <button
          className={
            activeReport === "purchases"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveReport("purchases")
          }
        >
          Purchases
        </button>


        <button
          className={
            activeReport === "payments"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveReport("payments")
          }
        >
          Payments
        </button>


        <button
          className={
            activeReport === "inventory"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveReport("inventory")
          }
        >
          Inventory
        </button>

      </div>


      {/* =================================================
          ONLY THIS AREA IS PRINTED
      ================================================= */}

      <div className="reports-print-area">

        {/* =================================================
            PRINT HEADER
        ================================================= */}

        <div className="print-report-header">

          <h1>Fresh Food Enterprises</h1>

          <h2>
            {getReportTitle()}
          </h2>

          <p>
            Report Period: {getPrintDateRange()}
          </p>

          <p>
            Generated on: {formatDate(new Date())}
          </p>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="reports-loading">
            Loading reports...
          </div>
        )}


        {/* =================================================
            OVERVIEW
        ================================================= */}

        {!loading &&
          activeReport === "overview" &&
          summary && (

            <div className="report-content">

              <h2>Business Overview</h2>


              {/* SALES */}

              <div className="report-section">

                <h3>Sales Summary</h3>

                <div className="report-card-grid">

                  <div className="report-card">

                    <span>
                      Total Sales
                    </span>

                    <strong>
                      {summary.sales.count}
                    </strong>

                  </div>


                  <div className="report-card">

                    <span>
                      Sales Amount
                    </span>

                    <strong>
                      {formatMoney(
                        summary.sales.totalAmount
                      )}
                    </strong>

                  </div>


                  <div className="report-card">

                    <span>
                      Sales Paid
                    </span>

                    <strong>
                      {formatMoney(
                        summary.sales.paidAmount
                      )}
                    </strong>

                  </div>


                  <div className="report-card pending-card">

                    <span>
                      Customer Pending
                    </span>

                    <strong>
                      {formatMoney(
                        summary.sales.pendingAmount
                      )}
                    </strong>

                  </div>

                </div>

              </div>


              {/* PURCHASES */}

              <div className="report-section">

                <h3>Purchase Summary</h3>

                <div className="report-card-grid">

                  <div className="report-card">

                    <span>
                      Total Purchases
                    </span>

                    <strong>
                      {summary.purchases.count}
                    </strong>

                  </div>


                  <div className="report-card">

                    <span>
                      Purchase Amount
                    </span>

                    <strong>
                      {formatMoney(
                        summary.purchases.totalAmount
                      )}
                    </strong>

                  </div>


                  <div className="report-card">

                    <span>
                      Purchase Paid
                    </span>

                    <strong>
                      {formatMoney(
                        summary.purchases.paidAmount
                      )}
                    </strong>

                  </div>


                  <div className="report-card pending-card">

                    <span>
                      Supplier Pending
                    </span>

                    <strong>
                      {formatMoney(
                        summary.purchases.pendingAmount
                      )}
                    </strong>

                  </div>

                </div>

              </div>


              {/* PAYMENTS */}

              <div className="report-section">

                <h3>Payment Summary</h3>

                <div className="report-card-grid">

                  <div className="report-card received-card">

                    <span>
                      Money Received
                    </span>

                    <strong>
                      {formatMoney(
                        summary.payments.totalReceived
                      )}
                    </strong>

                  </div>


                  <div className="report-card paid-card">

                    <span>
                      Money Paid
                    </span>

                    <strong>
                      {formatMoney(
                        summary.payments.totalPaid
                      )}
                    </strong>

                  </div>


                  <div className="report-card">

                    <span>
                      Customer Payments
                    </span>

                    <strong>
                      {
                        summary.payments
                          .customerTransactions
                      }
                    </strong>

                  </div>


                  <div className="report-card">

                    <span>
                      Supplier Payments
                    </span>

                    <strong>
                      {
                        summary.payments
                          .supplierTransactions
                      }
                    </strong>

                  </div>

                </div>

              </div>


              {/* INVENTORY */}

              <div className="report-section">

                <h3>Inventory Summary</h3>

                <div className="report-card-grid">

                  <div className="report-card">

                    <span>
                      Total Products
                    </span>

                    <strong>
                      {
                        summary.inventory
                          .totalProducts
                      }
                    </strong>

                  </div>


                  <div className="report-card">

                    <span>
                      Total Stock
                    </span>

                    <strong>
                      {
                        summary.inventory
                          .totalStockQuantity
                      }
                    </strong>

                  </div>


                  <div className="report-card low-stock-card">

                    <span>
                      Low Stock Products
                    </span>

                    <strong>
                      {
                        summary.inventory
                          .lowStockProducts
                      }
                    </strong>

                  </div>

                </div>

              </div>


              {/* FINANCIAL */}

              <div className="report-section">

                <h3>Financial Summary</h3>

                <div className="financial-summary">

                  <div>
                    <span>
                      Sales
                    </span>

                    <strong>
                      {formatMoney(
                        summary.financial.salesAmount
                      )}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Purchases
                    </span>

                    <strong>
                      {formatMoney(
                        summary.financial.purchaseAmount
                      )}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Money Received
                    </span>

                    <strong>
                      {formatMoney(
                        summary.financial.moneyReceived
                      )}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Money Paid
                    </span>

                    <strong>
                      {formatMoney(
                        summary.financial.moneyPaid
                      )}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Customer Pending
                    </span>

                    <strong>
                      {formatMoney(
                        summary.financial.customerPending
                      )}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Supplier Pending
                    </span>

                    <strong>
                      {formatMoney(
                        summary.financial.supplierPending
                      )}
                    </strong>
                  </div>

                </div>

              </div>

            </div>
          )}


        {/* =================================================
            SALES REPORT
        ================================================= */}

        {!loading &&
          activeReport === "sales" && (

            <div className="report-table-section">

              <div className="table-header">

                <div>
                  <h2>Sales Report</h2>

                  <p>
                    {sales.length} sales found
                  </p>
                </div>

              </div>


              <div className="report-table-wrapper">

                <table className="report-table">

                  <thead>

                    <tr>
                      <th>Invoice</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Paid</th>
                      <th>Pending</th>
                      <th>Status</th>
                    </tr>

                  </thead>


                  <tbody>

                    {sales.length === 0 ? (

                      <tr>
                        <td
                          colSpan="7"
                          className="empty-report"
                        >
                          No sales found.
                        </td>
                      </tr>

                    ) : (

                      sales.map((sale) => (

                        <tr key={sale._id}>

                          <td>
                            {sale.invoiceNumber}
                          </td>

                          <td>
                            {sale.customer}
                          </td>

                          <td>
                            {formatDate(
                              sale.saleDate
                            )}
                          </td>

                          <td>
                            {formatMoney(
                              sale.totalAmount
                            )}
                          </td>

                          <td>
                            {formatMoney(
                              sale.paidAmount
                            )}
                          </td>

                          <td>
                            {formatMoney(
                              sale.pendingAmount
                            )}
                          </td>

                          <td>

                            <span
                              className={`status-badge ${
                                sale.paymentStatus
                                  ?.toLowerCase()
                              }`}
                            >
                              {sale.paymentStatus}
                            </span>

                          </td>

                        </tr>

                      ))

                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}


        {/* =================================================
            PURCHASE REPORT
        ================================================= */}

        {!loading &&
          activeReport === "purchases" && (

            <div className="report-table-section">

              <div className="table-header">

                <div>
                  <h2>Purchase Report</h2>

                  <p>
                    {purchases.length} purchases found
                  </p>
                </div>

              </div>


              <div className="report-table-wrapper">

                <table className="report-table">

                  <thead>

                    <tr>
                      <th>Invoice</th>
                      <th>Supplier</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Paid</th>
                      <th>Pending</th>
                      <th>Status</th>
                    </tr>

                  </thead>


                  <tbody>

                    {purchases.length === 0 ? (

                      <tr>
                        <td
                          colSpan="7"
                          className="empty-report"
                        >
                          No purchases found.
                        </td>
                      </tr>

                    ) : (

                      purchases.map(
                        (purchase) => (

                          <tr key={purchase._id}>

                            <td>
                              {
                                purchase.invoiceNumber
                              }
                            </td>

                            <td>
                              {
                                purchase.supplier
                              }
                            </td>

                            <td>
                              {formatDate(
                                purchase.purchaseDate
                              )}
                            </td>

                            <td>
                              {formatMoney(
                                purchase.totalAmount
                              )}
                            </td>

                            <td>
                              {formatMoney(
                                purchase.paidAmount
                              )}
                            </td>

                            <td>
                              {formatMoney(
                                purchase.pendingAmount
                              )}
                            </td>

                            <td>

                              <span
                                className={`status-badge ${
                                  purchase.paymentStatus
                                    ?.toLowerCase()
                                }`}
                              >
                                {
                                  purchase.paymentStatus
                                }
                              </span>

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}


        {/* =================================================
            PAYMENT REPORT
        ================================================= */}

        {!loading &&
          activeReport === "payments" && (

            <div className="report-table-section">

              <div className="table-header">

                <div>
                  <h2>Payment Report</h2>

                  <p>
                    {payments.length} completed payments
                  </p>
                </div>

              </div>


              <div className="report-table-wrapper">

                <table className="report-table">

                  <thead>

                    <tr>
                      <th>Type</th>
                      <th>Customer / Supplier</th>
                      <th>Invoice</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Date</th>
                      <th>Transaction ID</th>
                    </tr>

                  </thead>


                  <tbody>

                    {payments.length === 0 ? (

                      <tr>
                        <td
                          colSpan="7"
                          className="empty-report"
                        >
                          No completed payments found.
                        </td>
                      </tr>

                    ) : (

                      payments.map(
                        (payment) => (

                          <tr key={payment._id}>

                            <td>

                              <span
                                className={`payment-type ${
                                  payment.paymentType
                                    ?.toLowerCase()
                                }`}
                              >
                                {
                                  payment.paymentType
                                }
                              </span>

                            </td>

                            <td>
                              {payment.person}
                            </td>

                            <td>
                              {
                                payment.invoiceNumber
                              }
                            </td>

                            <td>
                              {formatMoney(
                                payment.amount
                              )}
                            </td>

                            <td>
                              {
                                payment.paymentMethod
                              }
                            </td>

                            <td>
                              {formatDate(
                                payment.paymentDate
                              )}
                            </td>

                            <td>
                              {
                                payment.transactionId ||
                                "-"
                              }
                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}


        {/* =================================================
            INVENTORY REPORT
        ================================================= */}

        {!loading &&
          activeReport === "inventory" && (

            <div className="report-table-section">

              <div className="table-header">

                <div>
                  <h2>Inventory Report</h2>

                  <p>
                    {inventory.length} active products
                  </p>
                </div>

              </div>


              <div className="report-table-wrapper">

                <table className="report-table">

                  <thead>

                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Unit</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Stock Status</th>
                    </tr>

                  </thead>


                  <tbody>

                    {inventory.length === 0 ? (

                      <tr>
                        <td
                          colSpan="6"
                          className="empty-report"
                        >
                          No products found.
                        </td>
                      </tr>

                    ) : (

                      inventory.map(
                        (product) => (

                          <tr key={product._id}>

                            <td>
                              {product.name}
                            </td>

                            <td>
                              {product.category ||
                                "-"}
                            </td>

                            <td>
                              {product.unit ||
                                "-"}
                            </td>

                            <td>
                              {product.quantity}
                            </td>

                            <td>
                              {formatMoney(
                                product.price
                              )}
                            </td>

                            <td>

                              <span
                                className={`stock-badge ${
                                  product.stockStatus ===
                                  "Low Stock"
                                    ? "low"
                                    : "available"
                                }`}
                              >
                                {
                                  product.stockStatus
                                }
                              </span>

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

      </div>

    </div>
  );
}

export default Reports;