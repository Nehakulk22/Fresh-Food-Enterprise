import React, { useEffect, useState } from "react";
import "./Customers.css";

function Customers() {
  const [customers, setCustomers] = useState([]);
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

  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/customers"
      );

      const data = await response.json();

      if (response.ok) {
        setCustomers(data);
      } else {
        alert(data.message || "Unable to load customers");
      }
    } catch (error) {
      console.error("Fetch customers error:", error);
      alert("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
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
        "http://localhost:8000/api/customers",
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
        alert(data.message || "Failed to create customer");
        return;
      }

      alert("Customer added successfully");

      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        openingBalance: "",
        notes: "",
      });

      setShowForm(false);
      fetchCustomers();
    } catch (error) {
      console.error("Create customer error:", error);
      alert("Unable to connect to server.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/customers/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete customer");
        return;
      }

      alert("Customer deleted successfully");

      fetchCustomers();
    } catch (error) {
      console.error("Delete customer error:", error);
      alert("Unable to connect to server.");
    }
  };

  return (
    <div className="customers-page">

      <div className="customers-header">
        <div>
          <h1>Customers</h1>
          <p>Manage your business customers</p>
        </div>

        <button
          className="add-customer-button"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Customer
        </button>
      </div>

      {showForm && (
        <div className="customer-form-card">

          <h2>Add New Customer</h2>

          <form onSubmit={handleSubmit}>

            <div className="customer-form-grid">

              <div className="customer-input">
                <label>Customer Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter customer name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="customer-input">
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

              <div className="customer-input">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="customer-input">
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

              <div className="customer-input full-width">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter customer address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="customer-input full-width">
                <label>Notes</label>
                <textarea
                  name="notes"
                  placeholder="Enter notes"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="customer-form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-customer-button"
              >
                Save Customer
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="customers-card">

        <div className="customers-card-header">
          <div>
            <h2>Customer List</h2>
            <p>
              {customers.length} customer
              {customers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="customers-empty">
            <p>Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="customers-empty">

            <div className="customers-empty-icon">
              👥
            </div>

            <h3>No customers yet</h3>

            <p>
              Add your first customer to get started.
            </p>

          </div>
        ) : (
          <div className="customer-table-wrapper">

            <table className="customer-table">

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

                {customers.map((customer) => (
                  <tr key={customer._id}>

                    <td>
                      <strong>{customer.name}</strong>
                    </td>

                    <td>{customer.phone}</td>

                    <td>
                      {customer.email || "-"}
                    </td>

                    <td>
                      ₹
                      {Number(
                        customer.openingBalance || 0
                      ).toFixed(2)}
                    </td>

                    <td>
                      <button
                        className="delete-customer-button"
                        onClick={() =>
                          handleDelete(customer._id)
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

export default Customers;