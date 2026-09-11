import React, { useEffect, useState } from "react";
import "./Purchases.css";

const API_URL = "http://localhost:8000/api";

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    supplier: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    paidAmount: "",
    notes: "",
  });

  const [items, setItems] = useState([
    {
      product: "",
      quantity: "",
      purchasePrice: "",
    },
  ]);

  const fetchPurchases = async () => {
    try {
      const response = await fetch(`${API_URL}/purchases`);
      const data = await response.json();

      if (response.ok) {
        setPurchases(data);
      }
    } catch (error) {
      alert("Unable to connect to server");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_URL}/suppliers`);
      const data = await response.json();

      if (response.ok) {
        setSuppliers(data);
      }
    } catch (error) {
      console.error("Failed to fetch suppliers");
    }
  };

  useEffect(() => {
    fetchPurchases();
    fetchProducts();
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];

    updatedItems[index][field] = value;

    if (field === "product") {
      const selectedProduct = products.find(
        (product) => product._id === value
      );

      if (selectedProduct) {
        updatedItems[index].purchasePrice =
          selectedProduct.purchasePrice;
      }
    }

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        product: "",
        quantity: "",
        purchasePrice: "",
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const getItemTotal = (item) => {
    return (
      Number(item.quantity || 0) *
      Number(item.purchasePrice || 0)
    );
  };

  const getTotalAmount = () => {
    return items.reduce(
      (total, item) => total + getItemTotal(item),
      0
    );
  };

  const getPendingAmount = () => {
    return (
      getTotalAmount() -
      Number(formData.paidAmount || 0)
    );
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: "",
      supplier: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      paidAmount: "",
      notes: "",
    });

    setItems([
      {
        product: "",
        quantity: "",
        purchasePrice: "",
      },
    ]);

    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.invoiceNumber ||
      !formData.supplier ||
      !formData.purchaseDate
    ) {
      alert("Please fill all required fields");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.product &&
        Number(item.quantity) > 0 &&
        Number(item.purchasePrice) >= 0
    );

    if (validItems.length !== items.length) {
      alert("Please complete all product items");
      return;
    }

    const totalAmount = getTotalAmount();
    const paidAmount = Number(formData.paidAmount || 0);

    if (paidAmount < 0) {
      alert("Paid amount cannot be negative");
      return;
    }

    if (paidAmount > totalAmount) {
      alert("Paid amount cannot be greater than total amount");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/purchases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceNumber: formData.invoiceNumber,
          supplier: formData.supplier,
          purchaseDate: formData.purchaseDate,
          items: validItems.map((item) => ({
            product: item.product,
            quantity: Number(item.quantity),
            purchasePrice: Number(item.purchasePrice),
          })),
          paidAmount,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create purchase");
        return;
      }

      alert("Purchase created successfully");

      resetForm();
      fetchPurchases();
      fetchProducts();
    } catch (error) {
      alert("Unable to connect to server");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this purchase? Product stock will be reversed."
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/purchases/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete purchase");
        return;
      }

      alert("Purchase deleted successfully");

      fetchPurchases();
      fetchProducts();
    } catch (error) {
      alert("Unable to connect to server");
    }
  };

  return (
    <div className="purchases-page">
      <div className="purchases-header">
        <div>
          <h1>Purchases</h1>
          <p>Manage purchases and supplier transactions</p>
        </div>

        {!showForm && (
          <button
            className="add-purchase-btn"
            onClick={() => setShowForm(true)}
          >
            + Add Purchase
          </button>
        )}
      </div>

      {showForm && (
        <div className="purchase-form-card">
          <div className="purchase-form-header">
            <div>
              <h2>Add Purchase</h2>
              <p>Record a new purchase transaction</p>
            </div>

            <button
              className="close-purchase-btn"
              onClick={resetForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="purchase-basic-grid">
              <div className="purchase-form-group">
                <label>
                  Invoice Number <span>*</span>
                </label>

                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  placeholder="Enter invoice number"
                />
              </div>

              <div className="purchase-form-group">
                <label>
                  Supplier <span>*</span>
                </label>

                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                >
                  <option value="">Select supplier</option>

                  {suppliers.map((supplier) => (
                    <option
                      key={supplier._id}
                      value={supplier._id}
                    >
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="purchase-form-group">
                <label>
                  Purchase Date <span>*</span>
                </label>

                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="purchase-items-section">
              <div className="purchase-items-header">
                <h3>Products</h3>

                <button
                  type="button"
                  className="add-item-btn"
                  onClick={addItem}
                >
                  + Add Product
                </button>
              </div>

              {items.map((item, index) => (
                <div
                  className="purchase-item-row"
                  key={index}
                >
                  <div className="purchase-form-group product-field">
                    <label>Product</label>

                    <select
                      value={item.product}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "product",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select product
                      </option>

                      {products.map((product) => (
                        <option
                          key={product._id}
                          value={product._id}
                        >
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="purchase-form-group">
                    <label>Quantity</label>

                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="purchase-form-group">
                    <label>Purchase Price</label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.purchasePrice}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "purchasePrice",
                          e.target.value
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <div className="item-total">
                    <label>Total</label>
                    <strong>
                      ₹{getItemTotal(item).toFixed(2)}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() => removeItem(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="purchase-payment-section">
              <div className="purchase-summary">
                <div>
                  <span>Total Amount</span>
                  <strong>
                    ₹{getTotalAmount().toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>Paid Amount</span>

                  <input
                    type="number"
                    name="paidAmount"
                    min="0"
                    step="0.01"
                    value={formData.paidAmount}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="pending-row">
                  <span>Pending Amount</span>
                  <strong>
                    ₹{Math.max(getPendingAmount(), 0).toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="purchase-form-group notes-group">
              <label>Notes</label>

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes"
                rows="3"
              />
            </div>

            <div className="purchase-form-actions">
              <button
                type="button"
                className="cancel-purchase-btn"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-purchase-btn"
              >
                Save Purchase
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="purchases-card">
        <div className="purchases-card-header">
          <div>
            <h2>Purchase History</h2>
            <p>{purchases.length} purchase(s)</p>
          </div>
        </div>

        {purchases.length === 0 ? (
          <div className="empty-purchases">
            <div className="empty-purchase-icon">🧾</div>
            <h3>No Purchases Found</h3>
            <p>
              Add your first purchase transaction to get started.
            </p>

            {!showForm && (
              <button
                className="empty-purchase-btn"
                onClick={() => setShowForm(true)}
              >
                + Add Purchase
              </button>
            )}
          </div>
        ) : (
          <div className="purchase-table-container">
            <table className="purchases-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Pending</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase._id}>
                    <td>
                      <strong>
                        {purchase.invoiceNumber}
                      </strong>
                    </td>

                    <td>
                      {new Date(
                        purchase.purchaseDate
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      {purchase.supplier?.name || "—"}
                    </td>

                    <td>
                      {purchase.items?.length || 0}
                    </td>

                    <td>
                      ₹{Number(
                        purchase.totalAmount
                      ).toFixed(2)}
                    </td>

                    <td>
                      ₹{Number(
                        purchase.paidAmount
                      ).toFixed(2)}
                    </td>

                    <td>
                      ₹{Number(
                        purchase.pendingAmount
                      ).toFixed(2)}
                    </td>

                    <td>
                      <span
                        className={`purchase-status ${purchase.paymentStatus.toLowerCase()}`}
                      >
                        {purchase.paymentStatus}
                      </span>
                    </td>

                    <td>
                      <button
                        className="delete-purchase-btn"
                        onClick={() =>
                          handleDelete(purchase._id)
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

export default Purchases;