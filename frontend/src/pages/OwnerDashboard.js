import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function OwnerDashboard({ user }) {
<<<<<<< Updated upstream
const navigate = useNavigate();

const API_URL = "http://localhost:8000/api";

const [customers, setCustomers] = useState([]);
const [suppliers, setSuppliers] = useState([]);
const [products, setProducts] = useState([]);
const [purchases, setPurchases] = useState([]);
const [sales, setSales] = useState([]);

const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);

const [errors, setErrors] = useState({
customers: false,
suppliers: false,
products: false,
purchases: false,
sales: false,
});

// =========================
// GENERIC API FETCH
// =========================

const fetchData = async (endpoint, key) => {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || `Failed to fetch ${key}`
      );
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(`${key} API error:`, error);

    return {
      success: false,
      data: null,
    };
  }
};

// =========================
// FETCH DASHBOARD DATA
// =========================

const fetchDashboardData = useCallback(
async (showRefresh = false) => {
try {
if (showRefresh) {
setRefreshing(true);
} else {
setLoading(true);
}

    const [
      customersResult,
      suppliersResult,
      productsResult,
      purchasesResult,
      salesResult,
    ] = await Promise.all([
      fetchData("customers", "customers"),
      fetchData("suppliers", "suppliers"),
      fetchData("products", "products"),
      fetchData("purchases", "purchases"),
      fetchData("sales", "sales"),
    ]);

    // =========================
    // CUSTOMERS
    // =========================

    if (customersResult.success) {
      setCustomers(
        Array.isArray(customersResult.data)
          ? customersResult.data
          : customersResult.data?.customers || []
      );
    }

    // =========================
    // SUPPLIERS
    // =========================

    if (suppliersResult.success) {
      setSuppliers(
        Array.isArray(suppliersResult.data)
          ? suppliersResult.data
          : suppliersResult.data?.suppliers || []
      );
    }

    // =========================
    // PRODUCTS
    // =========================

    if (productsResult.success) {
      setProducts(
        Array.isArray(productsResult.data)
          ? productsResult.data
          : productsResult.data?.products || []
      );
    }

    // =========================
    // PURCHASES
    // =========================

    if (purchasesResult.success) {
      setPurchases(
        Array.isArray(purchasesResult.data)
          ? purchasesResult.data
          : purchasesResult.data?.purchases || []
      );
    }

    // =========================
    // SALES
    // =========================

    if (salesResult.success) {
      setSales(
        Array.isArray(salesResult.data)
          ? salesResult.data
          : salesResult.data?.sales || []
      );
    }

    // =========================
    // SAVE API ERRORS
    // =========================

    setErrors({
      customers: !customersResult.success,
      suppliers: !suppliersResult.success,
      products: !productsResult.success,
      purchases: !purchasesResult.success,
      sales: !salesResult.success,
    });
  } catch (error) {
    console.error(
      "Dashboard refresh error:",
      error
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
},
[]

);

// =========================
// INITIAL LOAD
// =========================

useEffect(() => {
fetchDashboardData();
}, [fetchDashboardData]);

// =========================
// AUTO REFRESH EVERY 10 SEC
// =========================

useEffect(() => {
const interval = setInterval(() => {
fetchDashboardData(true);
}, 10000);

return () => {
  clearInterval(interval);
};

}, [fetchDashboardData]);

// =========================
// REFRESH WHEN TAB ACTIVE
// =========================

useEffect(() => {
const handleVisibilityChange = () => {
if (document.visibilityState === "visible") {
fetchDashboardData(true);
}
};

document.addEventListener(
  "visibilitychange",
  handleVisibilityChange
);

return () => {
  document.removeEventListener(
    "visibilitychange",
    handleVisibilityChange
  );
};

}, [fetchDashboardData]);

// =========================
// PURCHASE CALCULATIONS
// =========================

const totalPurchases = purchases.reduce(
(sum, purchase) =>
sum + Number(purchase.totalAmount || 0),
0
);

const totalPurchasePaid = purchases.reduce(
(sum, purchase) =>
sum + Number(purchase.paidAmount || 0),
0
);

const totalPurchasePending = purchases.reduce(
(sum, purchase) =>
sum + Number(purchase.pendingAmount || 0),
0
);

// =========================
// SALES CALCULATIONS
// =========================

const totalSales = sales.reduce(
(sum, sale) =>
sum + Number(sale.totalAmount || 0),
0
);

const totalSalesPaid = sales.reduce(
(sum, sale) =>
sum + Number(sale.paidAmount || 0),
0
);

const totalSalesPending = sales.reduce(
(sum, sale) =>
sum + Number(sale.pendingAmount || 0),
0
);

// =========================
// LOW STOCK PRODUCTS
// =========================

const lowStockProducts = products.filter(
(product) =>
Number(product.quantity || 0) <=
Number(product.lowStockThreshold || 5)
);

// =========================
// CURRENCY FORMAT
// =========================

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};


// =========================
// DATE FORMAT
// =========================

const formatDate = (date) => {
if (!date) {
return "-";
}

return new Date(date).toLocaleDateString(
  "en-IN"
);

};

// =========================
// DASHBOARD UI
// =========================

return (
<div className="dashboard-content">

  {/* ================= HEADER ================= */}

  <div className="dashboard-header">

    <div>
      <h1>Dashboard</h1>

      <p>
        Welcome back,{" "}
        <strong>
          {user?.name || "Owner"}
        </strong>
      </p>
    </div>

    <button
      className="refresh-button"
      onClick={() =>
        fetchDashboardData(true)
      }
      disabled={refreshing}
    >
      {refreshing
        ? "Refreshing..."
        : "↻ Refresh"}
    </button>

  </div>

  {/* ================= LOADING ================= */}

  {loading ? (
    <div className="dashboard-loading">

      <div className="loading-spinner">
        ⟳
      </div>

      <p>
        Loading dashboard data...
      </p>

    </div>
  ) : (
    <>

      {/* ================= MAIN STATISTICS ================= */}

      <div className="stats-grid">

        {/* CUSTOMERS */}

        <div
          className="stat-card"
          onClick={() =>
            navigate("/customers")
          }
        >

          <div className="stat-icon">
            👥
          </div>

          <div>

            <span>
              Total Customers
            </span>

            <h2>
              {customers.length}
            </h2>

            {errors.customers && (
              <small className="api-error">
                Unable to load
              </small>
            )}

          </div>

        </div>

        {/* SUPPLIERS */}

        <div
          className="stat-card"
          onClick={() =>
            navigate("/suppliers")
          }
        >

          <div className="stat-icon">
            🚚
          </div>

          <div>

            <span>
              Total Suppliers
            </span>

            <h2>
              {suppliers.length}
            </h2>

            {errors.suppliers && (
              <small className="api-error">
                Unable to load
              </small>
            )}

          </div>

        </div>

        {/* PRODUCTS */}

        <div
          className="stat-card"
          onClick={() =>
            navigate("/products")
          }
        >

          <div className="stat-icon">
            📦
          </div>

          <div>

            <span>
              Total Products
            </span>

            <h2>
              {products.length}
            </h2>

            {errors.products && (
              <small className="api-error">
                Unable to load
              </small>
            )}

          </div>

        </div>

        {/* LOW STOCK */}

        <div
          className="stat-card"
          onClick={() =>
            navigate("/products")
          }
        >

          <div className="stat-icon">
            ⚠️
          </div>

          <div>

            <span>
              Low Stock
            </span>

            <h2>
              {lowStockProducts.length}
            </h2>

          </div>

        </div>

      </div>

      {/* ================= FINANCIAL CARDS ================= */}

      <div className="financial-grid">

        {/* SALES */}

        <div
          className="financial-card"
          onClick={() =>
            navigate("/sales")
          }
        >

          <div className="financial-title">

            <span>
              Total Sales
            </span>

            <span className="financial-icon">
              💰
            </span>

          </div>

          <h2>
            {formatCurrency(totalSales)}
          </h2>

          <div className="financial-details">

            <p>
              <span>
                Paid
              </span>

              <strong>
                {formatCurrency(
                  totalSalesPaid
                )}
              </strong>
            </p>

            <p>
              <span>
                Pending
              </span>

              <strong>
                {formatCurrency(
                  totalSalesPending
                )}
              </strong>
            </p>

          </div>

          {errors.sales && (
            <small className="api-error">
              Unable to load sales data
            </small>
          )}

        </div>

        {/* PURCHASES */}

        <div
          className="financial-card"
          onClick={() =>
            navigate("/purchases")
          }
        >

          <div className="financial-title">

            <span>
              Total Purchases
            </span>

            <span className="financial-icon">
              🛒
            </span>

          </div>

          <h2>
            {formatCurrency(
              totalPurchases
            )}
          </h2>

          <div className="financial-details">

            <p>
              <span>
                Paid
              </span>

              <strong>
                {formatCurrency(
                  totalPurchasePaid
                )}
              </strong>
            </p>

            <p>
              <span>
                Pending
              </span>

              <strong>
                {formatCurrency(
                  totalPurchasePending
                )}
              </strong>
            </p>

          </div>

          {errors.purchases && (
            <small className="api-error">
              Unable to load purchase data
            </small>
          )}

        </div>

      </div>

      {/* ================= QUICK ACTIONS ================= */}

      <div className="dashboard-section">

        <div className="section-header">
          <h2>
            Quick Actions
          </h2>
        </div>

        <div className="quick-actions">

          <button
            onClick={() =>
              navigate("/customers")
            }
          >
            <span>👥</span>
            Customers
          </button>

          <button
            onClick={() =>
              navigate("/suppliers")
            }
          >
            <span>🚚</span>
            Suppliers
          </button>

          <button
            onClick={() =>
              navigate("/products")
            }
          >
            <span>📦</span>
            Products
          </button>

          <button
            onClick={() =>
              navigate("/sales")
            }
          >
            <span>💰</span>
            New Sale
          </button>

          <button
            onClick={() =>
              navigate("/purchases")
            }
          >
            <span>🛒</span>
            New Purchase
          </button>

        </div>

      </div>

      {/* ================= LOW STOCK ================= */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Low Stock Products
          </h2>

          <button
            className="view-button"
            onClick={() =>
              navigate("/products")
            }
          >
            View Products →
          </button>

        </div>

        {lowStockProducts.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              ✓
            </div>

            <p>
              All products have sufficient
              stock.
            </p>

          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Threshold</th>
                </tr>

              </thead>

              <tbody>

                {lowStockProducts
                  .slice(0, 5)
                  .map((product) => (

                    <tr
                      key={product._id}
                    >

                      <td>
                        {product.name}
                      </td>

                      <td>
                        {product.category}
                      </td>

                      <td className="low-stock-text">
                        {product.quantity}{" "}
                        {product.unit}
                      </td>

                      <td>
                        {
                          product.lowStockThreshold
                        }
                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ================= RECENT SALES ================= */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Recent Sales
          </h2>

          <button
            className="view-button"
            onClick={() =>
              navigate("/sales")
            }
          >
            View Sales →
          </button>

        </div>

        {sales.length === 0 ? (

          <div className="empty-state">

            <p>
              No sales recorded yet.
            </p>

          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {sales
                  .slice(0, 5)
                  .map((sale) => (

                    <tr
                      key={sale._id}
                    >

                      <td>
                        {sale.invoiceNumber}
                      </td>

                      <td>
                        {sale.customer?.name ||
                          "Unknown"}
                      </td>

                      <td>
                        {formatDate(
                          sale.saleDate
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          sale.totalAmount
                        )}
                      </td>

                      <td>

                        <span
                          className={`status-badge ${String(
                            sale.paymentStatus ||
                              ""
                          ).toLowerCase()}`}
                        >
                          {sale.paymentStatus ||
                            "-"}
                        </span>

                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ================= RECENT PURCHASES ================= */}

      <div className="dashboard-section">

        <div className="section-header">

          <h2>
            Recent Purchases
          </h2>

          <button
            className="view-button"
            onClick={() =>
              navigate("/purchases")
            }
          >
            View Purchases →
          </button>

        </div>

        {purchases.length === 0 ? (

          <div className="empty-state">

            <p>
              No purchases recorded yet.
            </p>

          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>Invoice</th>
                  <th>Supplier</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {purchases
                  .slice(0, 5)
                  .map((purchase) => (

                    <tr
                      key={purchase._id}
                    >

                      <td>
                        {
                          purchase.invoiceNumber
                        }
                      </td>

                      <td>
                        {purchase.supplier?.name ||
                          "Unknown"}
                      </td>

                      <td>
                        {formatDate(
                          purchase.purchaseDate
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          purchase.totalAmount
                        )}
                      </td>

                      <td>

                        <span
                          className={`status-badge ${String(
                            purchase.paymentStatus ||
                              ""
                          ).toLowerCase()}`}
                        >
                          {
                            purchase.paymentStatus ||
                            "-"
                          }
                        </span>

                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </>

  )}

</div>

);
}

export default OwnerDashboard;
=======
  const navigate = useNavigate();

  const API_URL = "http://localhost:8000/api";

  // =========================
  // STATE
  // =========================

  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [errors, setErrors] = useState({
    customers: false,
    suppliers: false,
    products: false,
    purchases: false,
    sales: false,
    payments: false,
  });

  // =========================
  // GENERIC API FETCH
  // =========================

  const fetchData = async (endpoint, key) => {
    try {
      const response = await fetch(`${API_URL}/${endpoint}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to fetch ${key}`
        );
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`${key} API error:`, error);

      return {
        success: false,
        data: null,
      };
    }
  };

  // =========================
  // FETCH DASHBOARD DATA
  // =========================

  const fetchDashboardData = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [
          customersResult,
          suppliersResult,
          productsResult,
          purchasesResult,
          salesResult,
          paymentsResult,
        ] = await Promise.all([
          fetchData("customers", "customers"),
          fetchData("suppliers", "suppliers"),
          fetchData("products", "products"),
          fetchData("purchases", "purchases"),
          fetchData("sales", "sales"),
          fetchData("payments", "payments"),
        ]);

        // =========================
        // CUSTOMERS
        // =========================

        if (customersResult.success) {
          setCustomers(
            Array.isArray(customersResult.data)
              ? customersResult.data
              : customersResult.data?.customers || []
          );
        }

        // =========================
        // SUPPLIERS
        // =========================

        if (suppliersResult.success) {
          setSuppliers(
            Array.isArray(suppliersResult.data)
              ? suppliersResult.data
              : suppliersResult.data?.suppliers || []
          );
        }

        // =========================
        // PRODUCTS
        // =========================

        if (productsResult.success) {
          setProducts(
            Array.isArray(productsResult.data)
              ? productsResult.data
              : productsResult.data?.products || []
          );
        }

        // =========================
        // PURCHASES
        // =========================

        if (purchasesResult.success) {
          setPurchases(
            Array.isArray(purchasesResult.data)
              ? purchasesResult.data
              : purchasesResult.data?.purchases || []
          );
        }

        // =========================
        // SALES
        // =========================

        if (salesResult.success) {
          setSales(
            Array.isArray(salesResult.data)
              ? salesResult.data
              : salesResult.data?.sales || []
          );
        }

        // =========================
        // PAYMENTS
        // =========================

        if (paymentsResult.success) {
          setPayments(
            Array.isArray(paymentsResult.data)
              ? paymentsResult.data
              : paymentsResult.data?.payments || []
          );
        }

        // =========================
        // SAVE API ERRORS
        // =========================

        setErrors({
          customers: !customersResult.success,
          suppliers: !suppliersResult.success,
          products: !productsResult.success,
          purchases: !purchasesResult.success,
          sales: !salesResult.success,
          payments: !paymentsResult.success,
        });
      } catch (error) {
        console.error(
          "Dashboard refresh error:",
          error
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // =========================
  // AUTO REFRESH EVERY 10 SEC
  // =========================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchDashboardData]);

  // =========================
  // REFRESH WHEN TAB ACTIVE
  // =========================

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDashboardData(true);
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [fetchDashboardData]);

  // =========================
  // PURCHASE CALCULATIONS
  // =========================

  const totalPurchases = purchases.reduce(
    (sum, purchase) =>
      sum + Number(purchase.totalAmount || 0),
    0
  );

  const totalPurchasePaid = purchases.reduce(
    (sum, purchase) =>
      sum + Number(purchase.paidAmount || 0),
    0
  );

  const totalPurchasePending = purchases.reduce(
    (sum, purchase) =>
      sum +
      Number(
        purchase.pendingAmount ??
          (
            Number(purchase.totalAmount || 0) -
            Number(purchase.paidAmount || 0)
          )
      ),
    0
  );

  // =========================
  // SALES CALCULATIONS
  // =========================

  const totalSales = sales.reduce(
    (sum, sale) =>
      sum + Number(sale.totalAmount || 0),
    0
  );

  const totalSalesPaid = sales.reduce(
    (sum, sale) =>
      sum + Number(sale.paidAmount || 0),
    0
  );

  const totalSalesPending = sales.reduce(
    (sum, sale) =>
      sum +
      Number(
        sale.pendingAmount ??
          (
            Number(sale.totalAmount || 0) -
            Number(sale.paidAmount || 0)
          )
      ),
    0
  );

  // =========================
  // PAYMENT CALCULATIONS
  // =========================

  /*
   * Payment module uses:
   *
   * paymentType:
   * "Customer" = money received from customer
   * "Supplier" = money paid to supplier
   *
   * status:
   * "Completed"
   * "Pending"
   * "Failed"
   *
   * Only COMPLETED payments are included
   * in the financial totals.
   */

  const completedPayments = payments.filter(
    (payment) =>
      String(payment.status || "").toLowerCase() ===
      "completed"
  );

  // Money received from customers

  const totalPaymentsReceived =
    completedPayments
      .filter(
        (payment) =>
          String(payment.paymentType || "").toLowerCase() ===
          "customer"
      )
      .reduce(
        (sum, payment) =>
          sum + Number(payment.amount || 0),
        0
      );

  // Money paid to suppliers

  const totalPaymentsPaid =
    completedPayments
      .filter(
        (payment) =>
          String(payment.paymentType || "").toLowerCase() ===
          "supplier"
      )
      .reduce(
        (sum, payment) =>
          sum + Number(payment.amount || 0),
        0
      );

  // Net payment balance

  const paymentBalance =
    totalPaymentsReceived -
    totalPaymentsPaid;

  // =========================
  // LOW STOCK PRODUCTS
  // =========================

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.quantity || 0) <=
      Number(product.lowStockThreshold || 5)
  );

  // =========================
  // CURRENCY FORMAT
  // =========================

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =========================
  // DATE FORMAT
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN"
    );
  };

  // =========================
  // PAYMENT PERSON NAME
  // =========================

  const getPaymentPerson = (payment) => {
    const paymentType = String(
      payment.paymentType || ""
    ).toLowerCase();

    if (paymentType === "customer") {
      return (
        payment.customer?.name ||
        payment.customer?.customerName ||
        "Customer"
      );
    }

    return (
      payment.supplier?.name ||
      payment.supplier?.supplierName ||
      "Supplier"
    );
  };

  // =========================
  // PAYMENT TYPE DISPLAY
  // =========================

  const getPaymentTypeLabel = (payment) => {
    const paymentType = String(
      payment.paymentType || ""
    ).toLowerCase();

    if (paymentType === "customer") {
      return "Received";
    }

    if (paymentType === "supplier") {
      return "Paid";
    }

    return payment.paymentType || "-";
  };

  // =========================
  // PAYMENT TYPE CLASS
  // =========================

  const getPaymentTypeClass = (payment) => {
    const paymentType = String(
      payment.paymentType || ""
    ).toLowerCase();

    if (paymentType === "customer") {
      return "payment-received-badge";
    }

    return "payment-paid-badge";
  };

  // =========================
  // DASHBOARD UI
  // =========================

  return (
    <div className="dashboard-content">

      {/* ================= HEADER ================= */}

      <div className="dashboard-header">

        <div>
          <h1>Dashboard</h1>

          <p>
            Welcome back{" "}
            <strong>
              {user?.name || "Owner"}
            </strong>
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={() =>
            fetchDashboardData(true)
          }
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "↻ Refresh"}
        </button>

      </div>

      {/* ================= LOADING ================= */}

      {loading ? (
        <div className="dashboard-loading">

          <div className="loading-spinner">
            ⟳
          </div>

          <p>
            Loading dashboard data...
          </p>

        </div>
      ) : (
        <>

          {/* ================= MAIN STATISTICS ================= */}

          <div className="stats-grid">

            {/* CUSTOMERS */}

            <div
              className="stat-card"
              onClick={() =>
                navigate("/customers")
              }
            >

              <div className="stat-icon">
                👥
              </div>

              <div>

                <span>
                  Total Customers
                </span>

                <h2>
                  {customers.length}
                </h2>

                {errors.customers && (
                  <small className="api-error">
                    Unable to load
                  </small>
                )}

              </div>

            </div>


            {/* SUPPLIERS */}

            <div
              className="stat-card"
              onClick={() =>
                navigate("/suppliers")
              }
            >

              <div className="stat-icon">
                🚚
              </div>

              <div>

                <span>
                  Total Suppliers
                </span>

                <h2>
                  {suppliers.length}
                </h2>

                {errors.suppliers && (
                  <small className="api-error">
                    Unable to load
                  </small>
                )}

              </div>

            </div>


            {/* PRODUCTS */}

            <div
              className="stat-card"
              onClick={() =>
                navigate("/products")
              }
            >

              <div className="stat-icon">
                📦
              </div>

              <div>

                <span>
                  Total Products
                </span>

                <h2>
                  {products.length}
                </h2>

                {errors.products && (
                  <small className="api-error">
                    Unable to load
                  </small>
                )}

              </div>

            </div>


            {/* LOW STOCK */}

            <div
              className="stat-card"
              onClick={() =>
                navigate("/products")
              }
            >

              <div className="stat-icon">
                ⚠️
              </div>

              <div>

                <span>
                  Low Stock
                </span>

                <h2>
                  {lowStockProducts.length}
                </h2>

              </div>

            </div>

          </div>


          {/* ================= SALES & PURCHASES ================= */}

          <div className="financial-grid">

            {/* SALES */}

            <div
              className="financial-card"
              onClick={() =>
                navigate("/sales")
              }
            >

              <div className="financial-title">

                <span>
                  Total Sales
                </span>

                <span className="financial-icon">
                  💰
                </span>

              </div>

              <h2>
                {formatCurrency(
                  totalSales
                )}
              </h2>

              <div className="financial-details">

                <p>
                  <span>
                    Paid
                  </span>

                  <strong>
                    {formatCurrency(
                      totalSalesPaid
                    )}
                  </strong>
                </p>

                <p>
                  <span>
                    Pending
                  </span>

                  <strong>
                    {formatCurrency(
                      totalSalesPending
                    )}
                  </strong>
                </p>

              </div>

              {errors.sales && (
                <small className="api-error">
                  Unable to load sales data
                </small>
              )}

            </div>


            {/* PURCHASES */}

            <div
              className="financial-card"
              onClick={() =>
                navigate("/purchases")
              }
            >

              <div className="financial-title">

                <span>
                  Total Purchases
                </span>

                <span className="financial-icon">
                  🛒
                </span>

              </div>

              <h2>
                {formatCurrency(
                  totalPurchases
                )}
              </h2>

              <div className="financial-details">

                <p>
                  <span>
                    Paid
                  </span>

                  <strong>
                    {formatCurrency(
                      totalPurchasePaid
                    )}
                  </strong>
                </p>

                <p>
                  <span>
                    Pending
                  </span>

                  <strong>
                    {formatCurrency(
                      totalPurchasePending
                    )}
                  </strong>
                </p>

              </div>

              {errors.purchases && (
                <small className="api-error">
                  Unable to load purchase data
                </small>
              )}

            </div>

          </div>


          {/* ================= PAYMENT SUMMARY ================= */}

          <div className="payment-dashboard-section">

            <div className="section-header">

              <div>
                <h2>
                  Payment Overview
                </h2>

                <p>
                  Customer receipts and
                  supplier payments
                </p>
              </div>

              <button
                className="view-button"
                onClick={() =>
                  navigate("/payments")
                }
              >
                View Payments →
              </button>

            </div>


            <div className="payment-dashboard-grid">

              {/* TOTAL RECEIVED */}

              <div
                className="payment-dashboard-card received-card"
                onClick={() =>
                  navigate("/payments")
                }
              >

                <div className="payment-dashboard-icon">
                  ↓
                </div>

                <div>

                  <span>
                    Total Received
                  </span>

                  <h2>
                    {formatCurrency(
                      totalPaymentsReceived
                    )}
                  </h2>

                  <small>
                    From customers
                  </small>

                </div>

              </div>


              {/* TOTAL PAID */}

              <div
                className="payment-dashboard-card paid-card"
                onClick={() =>
                  navigate("/payments")
                }
              >

                <div className="payment-dashboard-icon">
                  ↑
                </div>

                <div>

                  <span>
                    Total Paid
                  </span>

                  <h2>
                    {formatCurrency(
                      totalPaymentsPaid
                    )}
                  </h2>

                  <small>
                    To suppliers
                  </small>

                </div>

              </div>


              {/* BALANCE */}

              <div
                className="payment-dashboard-card balance-card"
                onClick={() =>
                  navigate("/payments")
                }
              >

                <div className="payment-dashboard-icon">
                  ₹
                </div>

                <div>

                  <span>
                    Payment Balance
                  </span>

                  <h2>
                    {formatCurrency(
                      paymentBalance
                    )}
                  </h2>

                  <small>
                    Received − Paid
                  </small>

                </div>

              </div>

            </div>

            {errors.payments && (
              <small className="api-error">
                Unable to load payment data
              </small>
            )}

          </div>


          {/* ================= QUICK ACTIONS ================= */}

          <div className="dashboard-section">

            <div className="section-header">

              <h2>
                Quick Actions
              </h2>

            </div>

            <div className="quick-actions">

              <button
                onClick={() =>
                  navigate("/customers")
                }
              >
                <span>👥</span>
                Customers
              </button>

              <button
                onClick={() =>
                  navigate("/suppliers")
                }
              >
                <span>🚚</span>
                Suppliers
              </button>

              <button
                onClick={() =>
                  navigate("/products")
                }
              >
                <span>📦</span>
                Products
              </button>

              <button
                onClick={() =>
                  navigate("/sales")
                }
              >
                <span>💰</span>
                New Sale
              </button>

              <button
                onClick={() =>
                  navigate("/purchases")
                }
              >
                <span>🛒</span>
                New Purchase
              </button>

              <button
                onClick={() =>
                  navigate("/payments")
                }
              >
                <span>💳</span>
                New Payment
              </button>

            </div>

          </div>


          {/* ================= LOW STOCK ================= */}

          <div className="dashboard-section">

            <div className="section-header">

              <h2>
                Low Stock Products
              </h2>

              <button
                className="view-button"
                onClick={() =>
                  navigate("/products")
                }
              >
                View Products →
              </button>

            </div>

            {lowStockProducts.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  ✓
                </div>

                <p>
                  All products have sufficient
                  stock.
                </p>

              </div>

            ) : (

              <div className="table-container">

                <table>

                  <thead>

                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Threshold</th>
                    </tr>

                  </thead>

                  <tbody>

                    {lowStockProducts
                      .slice(0, 5)
                      .map((product) => (

                        <tr
                          key={product._id}
                        >

                          <td>
                            {product.name}
                          </td>

                          <td>
                            {product.category}
                          </td>

                          <td className="low-stock-text">
                            {product.quantity}{" "}
                            {product.unit}
                          </td>

                          <td>
                            {
                              product.lowStockThreshold
                            }
                          </td>

                        </tr>

                      ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>


          {/* ================= RECENT SALES ================= */}

          <div className="dashboard-section">

            <div className="section-header">

              <h2>
                Recent Sales
              </h2>

              <button
                className="view-button"
                onClick={() =>
                  navigate("/sales")
                }
              >
                View Sales →
              </button>

            </div>

            {sales.length === 0 ? (

              <div className="empty-state">

                <p>
                  No sales recorded yet.
                </p>

              </div>

            ) : (

              <div className="table-container">

                <table>

                  <thead>

                    <tr>
                      <th>Invoice</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {sales
                      .slice(0, 5)
                      .map((sale) => (

                        <tr
                          key={sale._id}
                        >

                          <td>
                            {sale.invoiceNumber}
                          </td>

                          <td>
                            {sale.customer?.name ||
                              "Unknown"}
                          </td>

                          <td>
                            {formatDate(
                              sale.saleDate
                            )}
                          </td>

                          <td>
                            {formatCurrency(
                              sale.totalAmount
                            )}
                          </td>

                          <td>

                            <span
                              className={`status-badge ${String(
                                sale.paymentStatus ||
                                  ""
                              ).toLowerCase()}`}
                            >
                              {sale.paymentStatus ||
                                "-"}
                            </span>

                          </td>

                        </tr>

                      ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>


          {/* ================= RECENT PURCHASES ================= */}

          <div className="dashboard-section">

            <div className="section-header">

              <h2>
                Recent Purchases
              </h2>

              <button
                className="view-button"
                onClick={() =>
                  navigate("/purchases")
                }
              >
                View Purchases →
              </button>

            </div>

            {purchases.length === 0 ? (

              <div className="empty-state">

                <p>
                  No purchases recorded yet.
                </p>

              </div>

            ) : (

              <div className="table-container">

                <table>

                  <thead>

                    <tr>
                      <th>Invoice</th>
                      <th>Supplier</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {purchases
                      .slice(0, 5)
                      .map((purchase) => (

                        <tr
                          key={purchase._id}
                        >

                          <td>
                            {
                              purchase.invoiceNumber
                            }
                          </td>

                          <td>
                            {purchase.supplier?.name ||
                              "Unknown"}
                          </td>

                          <td>
                            {formatDate(
                              purchase.purchaseDate
                            )}
                          </td>

                          <td>
                            {formatCurrency(
                              purchase.totalAmount
                            )}
                          </td>

                          <td>

                            <span
                              className={`status-badge ${String(
                                purchase.paymentStatus ||
                                  ""
                              ).toLowerCase()}`}
                            >
                              {
                                purchase.paymentStatus ||
                                "-"
                              }
                            </span>

                          </td>

                        </tr>

                      ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>


          {/* ================= RECENT PAYMENTS ================= */}

          <div className="dashboard-section">

            <div className="section-header">

              <h2>
                Recent Payments
              </h2>

              <button
                className="view-button"
                onClick={() =>
                  navigate("/payments")
                }
              >
                View Payments →
              </button>

            </div>


            {payments.length === 0 ? (

              <div className="empty-state">

                <p>
                  No payments recorded yet.
                </p>

              </div>

            ) : (

              <div className="table-container">

                <table>

                  <thead>

                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Customer / Supplier</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {payments
                      .slice(0, 5)
                      .map((payment) => (

                        <tr
                          key={payment._id}
                        >

                          <td>
                            {formatDate(
                              payment.paymentDate
                            )}
                          </td>


                          <td>

                            <span
                              className={getPaymentTypeClass(
                                payment
                              )}
                            >

                              {getPaymentTypeLabel(
                                payment
                              )}

                            </span>

                          </td>


                          <td>
                            {getPaymentPerson(
                              payment
                            )}
                          </td>


                          <td>
                            {formatCurrency(
                              payment.amount
                            )}
                          </td>


                          <td>
                            {
                              payment.paymentMethod
                            }
                          </td>


                          <td>

                            <span
                              className={`status-badge ${String(
                                payment.status ||
                                  ""
                              ).toLowerCase()}`}
                            >
                              {
                                payment.status ||
                                "Completed"
                              }
                            </span>

                          </td>

                        </tr>

                      ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </>

      )}

    </div>
  );
}

export default OwnerDashboard;
>>>>>>> Stashed changes
