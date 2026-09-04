import React, { useEffect, useState } from "react";
import "./Products.css";

const API_URL = "http://localhost:8000/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "",
    purchasePrice: "",
    sellingPrice: "",
    quantity: "",
    lowStockThreshold: "5",
    supplier: "",
    notes: "",
  });

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data);
      } else {
        alert(data.message || "Failed to fetch products");
      }
    } catch (error) {
      alert("Unable to connect to server");
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
    fetchProducts();
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      unit: "",
      purchasePrice: "",
      sellingPrice: "",
      quantity: "",
      lowStockThreshold: "5",
      supplier: "",
      notes: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.category ||
      !formData.unit ||
      formData.purchasePrice === "" ||
      formData.sellingPrice === ""
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (
      Number(formData.purchasePrice) < 0 ||
      Number(formData.sellingPrice) < 0
    ) {
      alert("Prices cannot be negative");
      return;
    }

    if (Number(formData.quantity || 0) < 0) {
      alert("Quantity cannot be negative");
      return;
    }

    const productData = {
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      purchasePrice: Number(formData.purchasePrice),
      sellingPrice: Number(formData.sellingPrice),
      quantity: Number(formData.quantity || 0),
      lowStockThreshold: Number(formData.lowStockThreshold || 5),
      supplier: formData.supplier || null,
      notes: formData.notes,
    };

    try {
      const url = editingId
        ? `${API_URL}/products/${editingId}`
        : `${API_URL}/products`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Something went wrong");
        return;
      }

      alert(
        editingId
          ? "Product updated successfully"
          : "Product added successfully"
      );

      resetForm();
      fetchProducts();
    } catch (error) {
      alert("Unable to connect to server");
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || "",
      category: product.category || "",
      unit: product.unit || "",
      purchasePrice: product.purchasePrice ?? "",
      sellingPrice: product.sellingPrice ?? "",
      quantity: product.quantity ?? "",
      lowStockThreshold: product.lowStockThreshold ?? "5",
      supplier: product.supplier?._id || "",
      notes: product.notes || "",
    });

    setEditingId(product._id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete product");
        return;
      }

      alert("Product deleted successfully");

      fetchProducts();
    } catch (error) {
      alert("Unable to connect to server");
    }
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <div>
          <h1>Products</h1>
          <p>Manage your products and stock</p>
        </div>

        {!showForm && (
          <button
            className="add-product-btn"
            onClick={() => setShowForm(true)}
          >
            + Add Product
          </button>
        )}
      </div>

      {showForm && (
        <div className="product-form-card">
          <div className="form-card-header">
            <div>
              <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
              <p>
                {editingId
                  ? "Update product information"
                  : "Enter product information"}
              </p>
            </div>

            <button
              className="close-form-btn"
              onClick={resetForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="product-form-grid">
              <div className="form-group">
                <label>
                  Product Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                />
              </div>

              <div className="form-group">
                <label>
                  Category <span>*</span>
                </label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Dairy, Bakery"
                />
              </div>

              <div className="form-group">
                <label>
                  Unit <span>*</span>
                </label>

                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  <option value="">Select unit</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="gram">Gram (g)</option>
                  <option value="litre">Litre (L)</option>
                  <option value="ml">Millilitre (ml)</option>
                  <option value="piece">Piece</option>
                  <option value="packet">Packet</option>
                  <option value="box">Box</option>
                  <option value="dozen">Dozen</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Purchase Price <span>*</span>
                </label>

                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>
                  Selling Price <span>*</span>
                </label>

                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Current Quantity</label>

                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Low Stock Threshold</label>

                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  placeholder="5"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Supplier</label>

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

              <div className="form-group full-width">
                <label>Notes</label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional product information"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-product-btn"
              >
                {editingId ? "Update Product" : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-card">
        <div className="products-card-header">
          <div>
            <h2>Product List</h2>
            <p>{products.length} product(s)</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="empty-products">
            <div className="empty-icon">📦</div>
            <h3>No Products Found</h3>
            <p>Add your first product to start managing your inventory.</p>

            {!showForm && (
              <button
                className="empty-add-btn"
                onClick={() => setShowForm(true)}
              >
                + Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Purchase Price</th>
                  <th>Selling Price</th>
                  <th>Stock</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const isLowStock =
                    Number(product.quantity) <=
                    Number(product.lowStockThreshold);

                  return (
                    <tr key={product._id}>
                      <td>
                        <strong>{product.name}</strong>
                      </td>

                      <td>{product.category}</td>

                      <td>{product.unit}</td>

                      <td>
                        ₹{Number(product.purchasePrice).toFixed(2)}
                      </td>

                      <td>
                        ₹{Number(product.sellingPrice).toFixed(2)}
                      </td>

                      <td>
                        <span
                          className={
                            isLowStock
                              ? "stock-low"
                              : "stock-normal"
                          }
                        >
                          {product.quantity} {product.unit}
                        </span>
                      </td>

                      <td>
                        {product.supplier?.name || "—"}
                      </td>

                      <td>
                        {isLowStock ? (
                          <span className="status-badge low">
                            Low Stock
                          </span>
                        ) : (
                          <span className="status-badge available">
                            Available
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(product)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(product._id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;