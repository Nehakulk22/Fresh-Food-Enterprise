import React, { useEffect, useState } from "react";
import "./Suppliers.css";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    openingBalance: "",
    notes: "",
  });

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/suppliers"
      );

      const data = await response.json();

      if (response.ok) {
        setSuppliers(data);
      } else {
        alert(data.message || "Unable to load suppliers");
      }
    } catch (error) {
      console.error("Fetch suppliers error:", error);
      alert("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:8000/api/suppliers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            openingBalance:
              Number(formData.openingBalance) || 0,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create supplier");
        return;
      }

      alert("Supplier added successfully");

      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        openingBalance: "",
        notes: "",
      });

      setShowForm(false);
      fetchSuppliers();
    } catch (error) {
      console.error("Create supplier error:", error);
      alert("Unable to connect to server.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/suppliers/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete supplier");
        return;
      }

      alert("Supplier deleted successfully");

      fetchSuppliers();
    } catch (error) {
      console.error("Delete supplier error:", error);
      alert("Unable to connect to server.");
    }
  };

  return (
    <div className="suppliers-page">

      <div className="suppliers-header">

        <div>
          <h1>Suppliers</h1>
          <p>Manage your business suppliers</p>
        </div>

        <button
          className="add-supplier-button"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Supplier
        </button>

      </div>

      {showForm && (
        <div className="supplier-form-card">

          <h2>Add New Supplier</h2>

          <form onSubmit={handleSubmit}>

            <div className="supplier-form-grid">

              <div className="supplier-input">
                <label>Supplier Name *</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter supplier name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="supplier-input">
                <label>Phone Number *</label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="supplier-input">
                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="supplier-input">
                <label>Opening Balance</label>

                <input
                  type="number"
                  name="openingBalance"
                  placeholder="0"
                  min="0"
                  value={formData.openingBalance}
                  onChange={handleChange}
                />
              </div>

              <div className="supplier-input full-width">
                <label>Address</label>

                <input
                  type="text"
                  name="address"
                  placeholder="Enter supplier address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="supplier-input full-width">
                <label>Notes</label>

                <textarea
                  name="notes"
                  placeholder="Enter notes"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="supplier-form-actions">

              <button
                type="button"
                className="cancel-supplier-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-supplier-button"
              >
                Save Supplier
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="suppliers-card">

        <div className="suppliers-card-header">

          <div>
            <h2>Supplier List</h2>

            <p>
              {suppliers.length} supplier
              {suppliers.length !== 1 ? "s" : ""}
            </p>
          </div>

        </div>

        {loading ? (
          <div className="suppliers-empty">
            <p>Loading suppliers...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="suppliers-empty">

            <div className="suppliers-empty-icon">
              🚚
            </div>

            <h3>No suppliers yet</h3>

            <p>
              Add your first supplier to get started.
            </p>

          </div>
        ) : (
          <div className="supplier-table-wrapper">

            <table className="supplier-table">

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Opening Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {suppliers.map((supplier) => (
                  <tr key={supplier._id}>

                    <td>
                      <strong>{supplier.name}</strong>
                    </td>

                    <td>{supplier.phone}</td>

                    <td>
                      {supplier.email || "-"}
                    </td>

                    <td>
                      ₹
                      {Number(
                        supplier.openingBalance || 0
                      ).toFixed(2)}
                    </td>

                    <td>
                      <button
                        className="delete-supplier-button"
                        onClick={() =>
                          handleDelete(supplier._id)
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

export default Suppliers;