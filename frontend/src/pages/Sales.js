import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8000/api";

function Sales() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customer, setCustomer] = useState("");
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [paidAmount, setPaidAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([
    {
      product: "",
      quantity: 1,
      sellingPrice: 0,
    },
  ]);


  // ==========================================
  // FETCH DATA
  // ==========================================

  const fetchData = async () => {
    try {
      const [
        customersResponse,
        productsResponse,
        salesResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/customers`),
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/sales`),
      ]);


      const customersData = await customersResponse.json();
      const productsData = await productsResponse.json();
      const salesData = await salesResponse.json();


      if (customersResponse.ok) {
        setCustomers(
          customersData.customers || customersData || []
        );
      }


      if (productsResponse.ok) {
        setProducts(
          productsData.products || productsData || []
        );
      }


      if (salesResponse.ok) {
        setSales(
          salesData.sales || salesData || []
        );
      }

    } catch (error) {
      console.error("Fetch sales data error:", error);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);


  // ==========================================
  // PRODUCT SELECTION
  // ==========================================

  const handleProductChange = (index, productId) => {
    const selectedProduct = products.find(
      (product) => product._id === productId
    );


    const updatedItems = [...items];

    updatedItems[index].product = productId;

    updatedItems[index].sellingPrice = selectedProduct
      ? Number(selectedProduct.sellingPrice || 0)
      : 0;

    setItems(updatedItems);
  };


  // ==========================================
  // QUANTITY CHANGE
  // ==========================================

  const handleQuantityChange = (index, quantity) => {
    const updatedItems = [...items];

    updatedItems[index].quantity = Number(quantity);

    setItems(updatedItems);
  };


  // ==========================================
  // PRICE CHANGE
  // ==========================================

  const handlePriceChange = (index, price) => {
    const updatedItems = [...items];

    updatedItems[index].sellingPrice = Number(price);

    setItems(updatedItems);
  };


  // ==========================================
  // ADD ITEM
  // ==========================================

  const addItem = () => {
    setItems([
      ...items,
      {
        product: "",
        quantity: 1,
        sellingPrice: 0,
      },
    ]);
  };


  // ==========================================
  // REMOVE ITEM
  // ==========================================

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems(items.filter((_, itemIndex) => itemIndex !== index));
  };


  // ==========================================
  // TOTAL
  // ==========================================

  const totalAmount = items.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) *
        Number(item.sellingPrice || 0),
    0
  );


  // Pending Amount = Total - Paid
  const pendingAmount =
    totalAmount - Number(paidAmount || 0);


  // ==========================================
  // PAYMENT STATUS
  // ==========================================

  const getPaymentStatus = () => {
    if (totalAmount === 0) {
      return "Pending";
    }

    if (pendingAmount === 0) {
      return "Paid";
    }

    if (Number(paidAmount || 0) > 0) {
      return "Partial";
    }

    return "Pending";
  };


  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setInvoiceNumber("");
    setCustomer("");
    setSaleDate(
      new Date().toISOString().split("T")[0]
    );
    setPaidAmount("");
    setNotes("");

    setItems([
      {
        product: "",
        quantity: 1,
        sellingPrice: 0,
      },
    ]);
  };


  // ==========================================
  // CREATE SALE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!invoiceNumber.trim()) {
      alert("Please enter invoice number");
      return;
    }


    if (!customer) {
      alert("Please select customer");
      return;
    }


    for (const item of items) {
      if (!item.product) {
        alert("Please select a product for every row");
        return;
      }

      if (!item.quantity || item.quantity <= 0) {
        alert("Quantity must be greater than zero");
        return;
      }
    }


    if (Number(paidAmount || 0) > totalAmount) {
      alert("Paid amount cannot be greater than total amount");
      return;
    }


    try {
      setLoading(true);


      const response = await fetch(`${API_URL}/sales`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          invoiceNumber,
          customer,
          saleDate,
          items,
          paidAmount: Number(paidAmount || 0),
          notes,
        }),
      });


      const data = await response.json();


      if (!response.ok) {
        alert(data.message || "Failed to create sale");
        return;
      }


      alert("Sale created successfully");


      resetForm();

      setShowForm(false);

      await fetchData();

    } catch (error) {
      console.error("Create sale error:", error);

      alert("Unable to connect to server");

    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // DELETE SALE
  // ==========================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this sale? Product stock will be restored."
    );


    if (!confirmDelete) {
      return;
    }


    try {
      const response = await fetch(
        `${API_URL}/sales/${id}`,
        {
          method: "DELETE",
        }
      );


      const data = await response.json();


      if (!response.ok) {
        alert(data.message || "Failed to delete sale");
        return;
      }


      alert("Sale deleted successfully");

      await fetchData();

    } catch (error) {
      console.error("Delete sale error:", error);

      alert("Unable to connect to server");
    }
  };


  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };


  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };


  return (
    <div className="module-page">

      {/* HEADER */}
      <div className="module-header">

        <div>
          <h1>Sales</h1>

          <p>
            Manage sales, customer payments and stock.
          </p>
        </div>


        <button
          className="primary-button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Sale
        </button>

      </div>


      {/* FORM */}
      {showForm && (

        <div className="form-card">

          <div className="form-card-header">

            <div>
              <h2>Add New Sale</h2>

              <p>
                Record a sale to a customer.
              </p>
            </div>


            <button
              className="close-button"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            {/* BASIC DETAILS */}
            <div className="form-grid">

              <div className="form-group">

                <label>
                  Invoice Number *
                </label>

                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) =>
                    setInvoiceNumber(e.target.value)
                  }
                  placeholder="INV-001"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Customer *
                </label>

                <select
                  value={customer}
                  onChange={(e) =>
                    setCustomer(e.target.value)
                  }
                  required
                >

                  <option value="">
                    Select Customer
                  </option>

                  {customers.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.name}
                      {item.phone
                        ? ` - ${item.phone}`
                        : ""}
                    </option>
                  ))}

                </select>

              </div>


              <div className="form-group">

                <label>
                  Sale Date *
                </label>

                <input
                  type="date"
                  value={saleDate}
                  onChange={(e) =>
                    setSaleDate(e.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* PRODUCTS */}
            <div className="items-section">

              <div className="items-header">

                <h3>Products</h3>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={addItem}
                >
                  + Add Product
                </button>

              </div>


              {items.map((item, index) => (

                <div
                  className="sale-item-row"
                  key={index}
                >

                  <div className="form-group product-field">

                    <label>
                      Product *
                    </label>

                    <select
                      value={item.product}
                      onChange={(e) =>
                        handleProductChange(
                          index,
                          e.target.value
                        )
                      }
                      required
                    >

                      <option value="">
                        Select Product
                      </option>

                      {products.map((product) => (

                        <option
                          key={product._id}
                          value={product._id}
                        >
                          {product.name}
                          {" - Stock: "}
                          {product.quantity}
                          {" "}
                          {product.unit}
                        </option>

                      ))}

                    </select>

                  </div>


                  <div className="form-group">

                    <label>
                      Quantity *
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          index,
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Selling Price *
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.sellingPrice}
                      onChange={(e) =>
                        handlePriceChange(
                          index,
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>


                  <div className="item-total">

                    <label>
                      Total
                    </label>

                    <strong>
                      {formatCurrency(
                        Number(item.quantity || 0) *
                          Number(item.sellingPrice || 0)
                      )}
                    </strong>

                  </div>


                  <button
                    type="button"
                    className="remove-item-button"
                    onClick={() =>
                      removeItem(index)
                    }
                    disabled={items.length === 1}
                  >
                    ×
                  </button>

                </div>

              ))}

            </div>


            {/* PAYMENT */}
            <div className="payment-section">

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Paid Amount
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paidAmount}
                    onChange={(e) =>
                      setPaidAmount(e.target.value)
                    }
                    placeholder="0"
                  />

                </div>


                <div className="amount-box">

                  <span>
                    Total Amount
                  </span>

                  <strong>
                    {formatCurrency(totalAmount)}
                  </strong>

                </div>


                <div className="amount-box pending-box">

                  <span>
                    Pending Amount
                  </span>

                  <strong>
                    {formatCurrency(
                      Math.max(pendingAmount, 0)
                    )}
                  </strong>

                </div>


                <div className="amount-box">

                  <span>
                    Payment Status
                  </span>

                  <strong>
                    {getPaymentStatus()}
                  </strong>

                </div>

              </div>

            </div>


            {/* NOTES */}
            <div className="form-group">

              <label>
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                placeholder="Optional notes"
                rows="3"
              />

            </div>


            {/* BUTTONS */}
            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>


              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Save Sale"}
              </button>

            </div>

          </form>

        </div>

      )}


      {/* SALES HISTORY */}
      <div className="table-card">

        <div className="table-card-header">

          <div>
            <h2>Sales History</h2>

            <p>
              All recorded sales transactions.
            </p>
          </div>

        </div>


        {sales.length === 0 ? (

          <div className="empty-module">

            <div className="empty-module-icon">
              💰
            </div>

            <h3>No sales found</h3>

            <p>
              Add your first sale to see it here.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="module-table">

              <thead>

                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Products</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Pending</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>

              </thead>


              <tbody>

                {sales.map((sale) => (

                  <tr key={sale._id}>

                    <td>
                      <strong>
                        {sale.invoiceNumber}
                      </strong>
                    </td>


                    <td>
                      {sale.customer?.name || "-"}
                    </td>


                    <td>
                      {formatDate(
                        sale.saleDate ||
                          sale.createdAt
                      )}
                    </td>


                    <td>
                      {sale.items?.length || 0}
                    </td>


                    <td>
                      {formatCurrency(
                        sale.totalAmount
                      )}
                    </td>


                    <td>
                      {formatCurrency(
                        sale.paidAmount
                      )}
                    </td>


                    <td>
                      {formatCurrency(
                        sale.pendingAmount
                      )}
                    </td>


                    <td>

                      <span
                        className={`status-badge ${
                          sale.paymentStatus?.toLowerCase()
                        }`}
                      >
                        {sale.paymentStatus}
                      </span>

                    </td>


                    <td>

                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDelete(sale._id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Sales;