import React, { useCallback, useEffect, useState } from "react";
import "./Payments.css";

const API_URL = "http://localhost:8000/api";

function Payment() {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialForm = {
    paymentType: "Supplier",
    customer: "",
    supplier: "",
    sale: "",
    purchase: "",
    amount: "",
    paymentMethod: "Cash",
    paymentDate: new Date().toISOString().slice(0, 10),
    transactionId: "",
    notes: "",
    status: "Completed",
  };

  const [form, setForm] = useState(initialForm);

  // ======================================================
  // AUTH HEADERS
  // ======================================================

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // ======================================================
  // LOAD DATA
  // ======================================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [p, c, s, salesData, purchasesData] =
        await Promise.all([
          fetch(`${API_URL}/payments`, {
            headers: getHeaders(),
          }),

          fetch(`${API_URL}/customers`, {
            headers: getHeaders(),
          }),

          fetch(`${API_URL}/suppliers`, {
            headers: getHeaders(),
          }),

          fetch(`${API_URL}/sales`, {
            headers: getHeaders(),
          }),

          fetch(`${API_URL}/purchases`, {
            headers: getHeaders(),
          }),
        ]);

      const responses = [
        p,
        c,
        s,
        salesData,
        purchasesData,
      ];

      if (responses.some((r) => !r.ok)) {
        throw new Error(
          "Unable to load payment data"
        );
      }

      const [
        pd,
        cd,
        sd,
        saled,
        purchased,
      ] = await Promise.all(
        responses.map((r) => r.json())
      );

      setPayments(
        Array.isArray(pd) ? pd : []
      );

      setCustomers(
        Array.isArray(cd) ? cd : []
      );

      setSuppliers(
        Array.isArray(sd) ? sd : []
      );

      setSales(
        Array.isArray(saled) ? saled : []
      );

      setPurchases(
        Array.isArray(purchased)
          ? purchased
          : []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,

      ...(name === "paymentType"
        ? {
            customer: "",
            supplier: "",
            sale: "",
            purchase: "",
          }
        : {}),
    }));
  };

  // ======================================================
  // CREATE / UPDATE PAYMENT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const payload = {
        ...form,

        amount: Number(form.amount),

        customer:
          form.paymentType === "Customer"
            ? form.customer
            : null,

        supplier:
          form.paymentType === "Supplier"
            ? form.supplier
            : null,

        sale:
          form.paymentType === "Customer"
            ? form.sale
            : null,

        purchase:
          form.paymentType === "Supplier"
            ? form.purchase
            : null,
      };

      const response = await fetch(
        editingId
          ? `${API_URL}/payments/${editingId}`
          : `${API_URL}/payments`,
        {
          method: editingId ? "PUT" : "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Payment operation failed"
        );
      }

      alert(
        result.message ||
          "Payment saved successfully"
      );

      setForm(initialForm);
      setEditingId(null);

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // ======================================================
  // EDIT PAYMENT
  // ======================================================

  const handleEdit = (payment) => {
    setEditingId(payment._id);

    setForm({
      paymentType: payment.paymentType,

      customer:
        payment.customer?._id || "",

      supplier:
        payment.supplier?._id || "",

      sale:
        payment.sale?._id || "",

      purchase:
        payment.purchase?._id || "",

      amount: payment.amount,

      paymentMethod:
        payment.paymentMethod,

      paymentDate: payment.paymentDate
        ? new Date(
            payment.paymentDate
          )
            .toISOString()
            .slice(0, 10)
        : "",

      transactionId:
        payment.transactionId || "",

      notes: payment.notes || "",

      status: payment.status,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================================
  // DELETE PAYMENT
  // ======================================================

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this payment?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/payments/${id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Delete failed"
        );
      }

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // ======================================================
  // HELPERS
  // ======================================================

  const getName = (item) => {
    if (!item) return "N/A";

    return (
      item.name ||
      item.customerName ||
      item.supplierName ||
      "N/A"
    );
  };

  const getParty = (payment) =>
    payment.paymentType === "Customer"
      ? getName(payment.customer)
      : getName(payment.supplier);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      getParty(p)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (p.transactionId || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      p.paymentMethod
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      p.paymentType === filter;

    return (
      matchesSearch &&
      matchesFilter
    );
  });

  const totalReceived = payments
    .filter(
      (p) =>
        p.paymentType === "Customer" &&
        p.status === "Completed"
    )
    .reduce(
      (sum, p) =>
        sum + Number(p.amount),
      0
    );

  const totalPaid = payments
    .filter(
      (p) =>
        p.paymentType === "Supplier" &&
        p.status === "Completed"
    )
    .reduce(
      (sum, p) =>
        sum + Number(p.amount),
      0
    );

  const currency = (value) =>
    `₹${Number(
      value || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="payment-page">

      <div className="payment-header">

        <div>

          <h1>
            Payment Management
          </h1>

          <p>
            Manage customer receipts and supplier payments.
          </p>

        </div>

      </div>

      {error && (
        <div className="payment-error">
          {error}
        </div>
      )}

      <div className="payment-summary">

        <div className="payment-summary-card">

          <span>
            Total Received
          </span>

          <h2>
            {currency(totalReceived)}
          </h2>

          <small>
            Customer payments
          </small>

        </div>

        <div className="payment-summary-card">

          <span>
            Total Paid
          </span>

          <h2>
            {currency(totalPaid)}
          </h2>

          <small>
            Supplier payments
          </small>

        </div>

        <div className="payment-summary-card">

          <span>
            Transactions
          </span>

          <h2>
            {payments.length}
          </h2>

          <small>
            All payment records
          </small>

        </div>

      </div>

      <div className="payment-card">

        <h2>
          {editingId
            ? "Edit Payment"
            : "Record New Payment"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="payment-form"
        >

          <div className="payment-form-grid">

            <div className="payment-field">

              <label>
                Payment Type *
              </label>

              <select
                name="paymentType"
                value={form.paymentType}
                onChange={handleChange}
                required
                disabled={!!editingId}
              >

                <option value="Customer">
                  Customer Receipt
                </option>

                <option value="Supplier">
                  Supplier Payment
                </option>

              </select>

            </div>

            {form.paymentType ===
            "Customer" ? (
              <>

                <div className="payment-field">

                  <label>
                    Customer *
                  </label>

                  <select
                    name="customer"
                    value={form.customer}
                    onChange={handleChange}
                    required
                    disabled={!!editingId}
                  >

                    <option value="">
                      Select Customer
                    </option>

                    {customers.map((c) => (

                      <option
                        key={c._id}
                        value={c._id}
                      >
                        {getName(c)}
                      </option>

                    ))}

                  </select>

                </div>

                <div className="payment-field">

                  <label>
                    Related Sale *
                  </label>

                  <select
                    name="sale"
                    value={form.sale}
                    onChange={handleChange}
                    required
                    disabled={!!editingId}
                  >

                    <option value="">
                      Select Sale
                    </option>

                    {sales
                      .filter((s) => {

                        const customerId =
                          s.customer?._id ||
                          s.customer;

                        return (
                          customerId ===
                          form.customer
                        );
                      })
                      .map((s) => (

                        <option
                          key={s._id}
                          value={s._id}
                        >
                          {s.invoiceNumber ||
                            s._id}
                          {" – "}
                          {currency(
                            s.pendingAmount
                          )}
                        </option>

                      ))}

                  </select>

                </div>

              </>
            ) : (
              <>

                <div className="payment-field">

                  <label>
                    Supplier *
                  </label>

                  <select
                    name="supplier"
                    value={form.supplier}
                    onChange={handleChange}
                    required
                    disabled={!!editingId}
                  >

                    <option value="">
                      Select Supplier
                    </option>

                    {suppliers.map((s) => (

                      <option
                        key={s._id}
                        value={s._id}
                      >
                        {getName(s)}
                      </option>

                    ))}

                  </select>

                </div>

                <div className="payment-field">

                  <label>
                    Related Purchase *
                  </label>

                  <select
                    name="purchase"
                    value={form.purchase}
                    onChange={handleChange}
                    required
                    disabled={!!editingId}
                  >

                    <option value="">
                      Select Purchase
                    </option>

                    {purchases
                      .filter((p) => {

                        const supplierId =
                          p.supplier?._id ||
                          p.supplier;

                        return (
                          supplierId ===
                          form.supplier
                        );
                      })
                      .map((p) => (

                        <option
                          key={p._id}
                          value={p._id}
                        >
                          {p.invoiceNumber ||
                            p._id}
                          {" – "}
                          {currency(
                            p.pendingAmount
                          )}
                        </option>

                      ))}

                  </select>

                </div>

              </>
            )}

            <div className="payment-field">

              <label>
                Amount (₹) *
              </label>

              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                required
              />

            </div>

            <div className="payment-field">

              <label>
                Payment Method *
              </label>

              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                required
              >

                <option>
                  Cash
                </option>

                <option>
                  UPI
                </option>

                <option>
                  Bank Transfer
                </option>

                <option>
                  Cheque
                </option>

                <option>
                  Other
                </option>

              </select>

            </div>

            <div className="payment-field">

              <label>
                Payment Date *
              </label>

              <input
                type="date"
                name="paymentDate"
                value={form.paymentDate}
                onChange={handleChange}
                required
              />

            </div>

            <div className="payment-field">

              <label>
                Transaction ID
              </label>

              <input
                type="text"
                name="transactionId"
                value={form.transactionId}
                onChange={handleChange}
                placeholder="Enter reference ID"
              />

            </div>

            <div className="payment-field">

              <label>
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >

                <option value="Completed">
                  Completed
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Failed">
                  Failed
                </option>

              </select>

            </div>

            <div className="payment-field payment-full">

              <label>
                Notes
              </label>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Additional payment information"
                rows="3"
              />

            </div>

          </div>

          <div className="payment-actions">

            <button
              type="submit"
              className="payment-submit"
            >
              {editingId
                ? "Update Payment"
                : "Save Payment"}
            </button>

            {editingId && (

              <button
                type="button"
                className="payment-cancel"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                }}
              >
                Cancel
              </button>

            )}

          </div>

        </form>

      </div>

      <div className="payment-card">

        <div className="payment-table-header">

          <h2>
            Payment History
          </h2>

          <div className="payment-filters">

            <input
              type="text"
              placeholder="Search payments..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
            >

              <option value="All">
                All Payments
              </option>

              <option value="Customer">
                Customer
              </option>

              <option value="Supplier">
                Supplier
              </option>

            </select>

          </div>

        </div>

        {loading ? (

          <p>
            Loading payments...
          </p>

        ) : (

          <div className="payment-table-wrapper">

            <table className="payment-table">

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Party</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredPayments.length ===
                0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="payment-empty"
                    >
                      No payment records found.
                    </td>

                  </tr>

                ) : (

                  filteredPayments.map((p) => (

                    <tr key={p._id}>

                      <td>
                        {new Date(
                          p.paymentDate
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>

                      <td>
                        {p.paymentType}
                      </td>

                      <td>
                        {getParty(p)}
                      </td>

                      <td>
                        {p.paymentMethod}
                      </td>

                      <td className="payment-amount">
                        {currency(p.amount)}
                      </td>

                      <td>

                        <span
                          className={`payment-status ${p.status.toLowerCase()}`}
                        >
                          {p.status}
                        </span>

                      </td>

                      <td>

                        <div className="payment-row-actions">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(p)
                            }
                            title="Edit"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="payment-delete"
                            onClick={() =>
                              handleDelete(
                                p._id
                              )
                            }
                            title="Delete"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Payment;