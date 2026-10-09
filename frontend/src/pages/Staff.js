
import React, { useEffect, useState } from "react";
import "./Staff.css";

function Staff({ user }) {
  const API_URL = "http://localhost:8000/api";

  const emptyForm = {
    name: "",
    role: "",
    phone: "",
    email: "",
    password: "",
    joiningDate: "",
    salary: "",
    status: "Active",
    address: "",
    notes: "",

    permissions: {
      dashboard: true,
      customers: false,
      suppliers: false,
      products: false,
      sales: false,
      purchases: false,
      payments: false,
      expenses: false,
      reports: false,
    },
  };

  const [activeTab, setActiveTab] = useState("management");

  // ======================================================
  // STAFF MANAGEMENT STATES
  // ======================================================

  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [summary, setSummary] = useState({
    totalStaff: 0,
    activeStaff: 0,
    inactiveStaff: 0,
    totalSalary: 0,
  });

  // ======================================================
  // COMMON STATES
  // ======================================================

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ======================================================
  // STAFF ACTIVITY STATES
  // ======================================================

  const [activities, setActivities] = useState([]);

  const [activitySummary, setActivitySummary] = useState({
    totalActivities: 0,
    createActivities: 0,
    updateActivities: 0,
    deleteActivities: 0,
  });

  const [activityStaffFilter, setActivityStaffFilter] =
    useState("");

  const [activityModuleFilter, setActivityModuleFilter] =
    useState("");

  const [activityActionFilter, setActivityActionFilter] =
    useState("");

  const [activityFromDate, setActivityFromDate] =
    useState("");

  const [activityToDate, setActivityToDate] =
    useState("");

  const [activitySearch, setActivitySearch] =
    useState("");

  // ======================================================
  // AUTH HEADER
  // ======================================================

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  // ======================================================
  // STAFF MANAGEMENT
  // ======================================================

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const response = await fetch(
        `${API_URL}/staff?${params.toString()}`,
        {
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch staff."
        );
      }

      setStaff(data.staff || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(
        `${API_URL}/staff/summary`,
        {
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch summary."
        );
      }

      setSummary(
        data.summary || {
          totalStaff: 0,
          activeStaff: 0,
          inactiveStaff: 0,
          totalSalary: 0,
        }
      );
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [search, statusFilter]);

  useEffect(() => {
    fetchSummary();
  }, []);

  // ======================================================
  // FORM
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionChange = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission],
      },
    }));
  };

  const resetForm = () => {
    setFormData({
      ...emptyForm,
      permissions: {
        ...emptyForm.permissions,
      },
    });

    setEditingId(null);
  };

  // ======================================================
  // CREATE / UPDATE STAFF
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Staff name is required.");
      return;
    }

    if (!formData.role.trim()) {
      setError("Staff job role is required.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      setError(
        "Enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      setError("Enter a valid email address.");
      return;
    }

    if (!editingId && formData.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (!formData.joiningDate) {
      setError("Joining date is required.");
      return;
    }

    const selectedDate = new Date(formData.joiningDate);
    const today = new Date();

    today.setHours(23, 59, 59, 999);

    if (selectedDate > today) {
      setError("Joining date cannot be in the future.");
      return;
    }

    if (
      formData.salary === "" ||
      Number(formData.salary) < 0
    ) {
      setError("Enter a valid salary.");
      return;
    }

    if (formData.address.length > 250) {
      setError("Address cannot exceed 250 characters.");
      return;
    }

    if (formData.notes.length > 500) {
      setError("Notes cannot exceed 500 characters.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        role: formData.role.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        joiningDate: formData.joiningDate,
        salary: Number(formData.salary),
        status: formData.status,
        address: formData.address.trim(),
        notes: formData.notes.trim(),
        permissions: formData.permissions,
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      const url = editingId
        ? `${API_URL}/staff/${editingId}`
        : `${API_URL}/staff`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save staff."
        );
      }

      setSuccess(
        editingId
          ? "Staff member updated successfully."
          : "Staff member created successfully."
      );

      resetForm();

      await fetchStaff();
      await fetchSummary();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (member) => {
    setActiveTab("management");

    setEditingId(member._id);

    setFormData({
      name: member.name || "",
      role: member.role || "",
      phone: member.phone || "",
      email: member.email || "",
      password: "",

      joiningDate: member.joiningDate
        ? new Date(member.joiningDate)
            .toISOString()
            .split("T")[0]
        : "",

      salary:
        member.salary !== undefined
          ? member.salary
          : "",

      status: member.status || "Active",
      address: member.address || "",
      notes: member.notes || "",

      permissions: {
        dashboard:
          member.permissions?.dashboard ?? true,
        customers:
          member.permissions?.customers ?? false,
        suppliers:
          member.permissions?.suppliers ?? false,
        products:
          member.permissions?.products ?? false,
        sales:
          member.permissions?.sales ?? false,
        purchases:
          member.permissions?.purchases ?? false,
        payments:
          member.permissions?.payments ?? false,
        expenses:
          member.permissions?.expenses ?? false,
        reports:
          member.permissions?.reports ?? false,
      },
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this staff member?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/staff/${id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete staff."
        );
      }

      setSuccess("Staff member deleted successfully.");

      await fetchStaff();
      await fetchSummary();
    } catch (err) {
      setError(err.message);
    }
  };

  // ======================================================
  // STAFF ACTIVITY
  // ======================================================

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      // Backend expects "staff"
      if (activityStaffFilter) {
        params.append(
          "staff",
          activityStaffFilter
        );
      }

      if (activityModuleFilter) {
        params.append(
          "module",
          activityModuleFilter
        );
      }

      if (activityActionFilter) {
        params.append(
          "action",
          activityActionFilter
        );
      }

      if (activityFromDate) {
        params.append(
          "fromDate",
          activityFromDate
        );
      }

      if (activityToDate) {
        params.append(
          "toDate",
          activityToDate
        );
      }

      if (activitySearch.trim()) {
        params.append(
          "search",
          activitySearch.trim()
        );
      }

      const queryString = params.toString();

      const response = await fetch(
        `${API_URL}/activities${
          queryString ? `?${queryString}` : ""
        }`,
        {
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch staff activities."
        );
      }

      setActivities(data.activities || []);
    } catch (err) {
      setActivities([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // ACTIVITY SUMMARY
  // ======================================================

  const fetchActivitySummary = async () => {
    try {
      const params = new URLSearchParams();

      if (activityStaffFilter) {
        params.append(
          "staff",
          activityStaffFilter
        );
      }

      if (activityModuleFilter) {
        params.append(
          "module",
          activityModuleFilter
        );
      }

      if (activityActionFilter) {
        params.append(
          "action",
          activityActionFilter
        );
      }

      if (activityFromDate) {
        params.append(
          "fromDate",
          activityFromDate
        );
      }

      if (activityToDate) {
        params.append(
          "toDate",
          activityToDate
        );
      }

      const queryString = params.toString();

      const response = await fetch(
        `${API_URL}/activities/summary${
          queryString ? `?${queryString}` : ""
        }`,
        {
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch activity summary."
        );
      }

      setActivitySummary(
        data.summary || {
          totalActivities: 0,
          createActivities: 0,
          updateActivities: 0,
          deleteActivities: 0,
        }
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // ======================================================
  // ACTIVITY EFFECT
  // ======================================================

  useEffect(() => {
    if (activeTab !== "activity") {
      return;
    }

    fetchActivities();
    fetchActivitySummary();
  }, [
    activeTab,
    activityStaffFilter,
    activityModuleFilter,
    activityActionFilter,
    activityFromDate,
    activityToDate,
    activitySearch,
  ]);

  // ======================================================
  // CLEAR ACTIVITY FILTERS
  // ======================================================

  const clearActivityFilters = () => {
    setActivityStaffFilter("");
    setActivityModuleFilter("");
    setActivityActionFilter("");
    setActivityFromDate("");
    setActivityToDate("");
    setActivitySearch("");
    setError("");
  };

  // ======================================================
  // FORMAT HELPERS
  // ======================================================

  const formatMoney = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="staff-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="staff-header">
        <div>
          <h1>Staff</h1>

          <p>
            Manage staff members and monitor their
            business activities.
          </p>
        </div>
      </div>

      {/* ==================================================
          MESSAGES
      ================================================== */}

      {error && (
        <div className="staff-message staff-error">
          {error}
        </div>
      )}

      {success && (
        <div className="staff-message staff-success">
          {success}
        </div>
      )}

      {/* ==================================================
          TWO STAFF OPTIONS
      ================================================== */}

      <div className="staff-tabs">

        <button
          type="button"
          className={
            activeTab === "management"
              ? "staff-tab active"
              : "staff-tab"
          }
          onClick={() => {
            setActiveTab("management");
            setError("");
          }}
        >
          👤 Staff Management
        </button>

        <button
          type="button"
          className={
            activeTab === "activity"
              ? "staff-tab active"
              : "staff-tab"
          }
          onClick={() => {
            setActiveTab("activity");
            setError("");
          }}
        >
          📋 Staff Activity
        </button>

      </div>

      {/* ==================================================
          STAFF MANAGEMENT
      ================================================== */}

      {activeTab === "management" && (
        <>

          {/* SUMMARY */}

          <div className="staff-summary">

            <div className="staff-summary-card">
              <span>Total Staff</span>
              <strong>
                {summary.totalStaff}
              </strong>
            </div>

            <div className="staff-summary-card active">
              <span>Active Staff</span>
              <strong>
                {summary.activeStaff}
              </strong>
            </div>

            <div className="staff-summary-card inactive">
              <span>Inactive Staff</span>
              <strong>
                {summary.inactiveStaff}
              </strong>
            </div>

            <div className="staff-summary-card salary">
              <span>Total Salary</span>
              <strong>
                {formatMoney(summary.totalSalary)}
              </strong>
            </div>

          </div>

          {/* FORM */}

          <div className="staff-form-card">

            <div className="staff-form-header">
              <div>
                <h2>
                  {editingId
                    ? "Edit Staff"
                    : "Add New Staff"}
                </h2>

                <p>
                  Enter staff information and assign
                  permissions.
                </p>
              </div>
            </div>

            <form
              className="staff-form-grid"
              onSubmit={handleSubmit}
            >

              <div className="staff-field">
                <label>Staff Name *</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter staff name"
                />
              </div>

              <div className="staff-field">
                <label>Job Role *</label>

                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Sales Staff"
                />
              </div>

              <div className="staff-field">
                <label>Phone *</label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                />
              </div>

              <div className="staff-field">
                <label>Email *</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="staff@example.com"
                />
              </div>

              <div className="staff-field">
                <label>
                  Password {editingId ? "" : "*"}
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    editingId
                      ? "Leave blank to keep current password"
                      : "Minimum 6 characters"
                  }
                />
              </div>

              <div className="staff-field">
                <label>Joining Date *</label>

                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                />
              </div>

              <div className="staff-field">
                <label>Salary *</label>

                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="Enter salary"
                  min="0"
                />
              </div>

              <div className="staff-field">
                <label>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </div>

              <div className="staff-field staff-field-full">
                <label>Address</label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  maxLength="250"
                  placeholder="Enter address"
                />
              </div>

              <div className="staff-field staff-field-full">
                <label>Notes</label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  maxLength="500"
                  placeholder="Additional notes"
                />
              </div>

              {/* PERMISSIONS */}

              <div className="permissions-section staff-field-full">

                <h3>Staff Permissions</h3>

                <div className="permissions-grid">

                  {[
                    ["dashboard", "Dashboard"],
                    ["customers", "Customers"],
                    ["suppliers", "Suppliers"],
                    ["products", "Products"],
                    ["sales", "Sales"],
                    ["purchases", "Purchases"],
                    ["payments", "Payments"],
                    ["expenses", "Expenses"],
                    ["reports", "Reports"],
                  ].map(([key, label]) => (

                    <label
                      className="permission-item"
                      key={key}
                    >
                      <input
                        type="checkbox"
                        checked={
                          formData.permissions[key]
                        }
                        onChange={() =>
                          handlePermissionChange(
                            key
                          )
                        }
                      />

                      <span>{label}</span>
                    </label>

                  ))}

                </div>
              </div>

              {/* FORM ACTIONS */}

              <div className="staff-form-actions staff-field-full">

                <button
                  type="submit"
                  disabled={saving}
                  className="staff-save-btn"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Staff"
                    : "Add Staff"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="staff-cancel-btn"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}

              </div>

            </form>
          </div>

          {/* STAFF LIST */}

          <div className="staff-list-card">

            <div className="staff-list-header">

              <div>
                <h2>Staff List</h2>

                <p>
                  View and manage all staff members.
                </p>
              </div>

              <div className="staff-filters">

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search staff..."
                />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                >
                  <option value="">
                    All Status
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>

              </div>

            </div>

            {loading ? (
              <div className="staff-loading">
                Loading...
              </div>
            ) : staff.length === 0 ? (
              <div className="staff-empty">

                <div className="staff-empty-icon">
                  👤
                </div>

                <h3>
                  No staff members found
                </h3>

                <p>
                  Add a staff member to get started.
                </p>

              </div>
            ) : (
              <div className="staff-table-wrapper">

                <table className="staff-table">

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Joining Date</th>
                      <th>Salary</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {staff.map((member) => (

                      <tr key={member._id}>

                        <td>
                          {member.name}
                        </td>

                        <td>
                          {member.role}
                        </td>

                        <td>
                          {member.phone}
                        </td>

                        <td>
                          {member.email}
                        </td>

                        <td>
                          {member.joiningDate
                            ? new Date(
                                member.joiningDate
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>

                        <td>
                          {formatMoney(
                            member.salary
                          )}
                        </td>

                        <td>

                          <span
                            className={
                              member.status ===
                              "Active"
                                ? "staff-status active"
                                : "staff-status inactive"
                            }
                          >
                            {member.status}
                          </span>

                        </td>

                        <td>

                          <div className="staff-actions">

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  member
                                )
                              }
                              className="staff-edit-btn"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  member._id
                                )
                              }
                              className="staff-delete-btn"
                            >
                              Delete
                            </button>

                          </div>

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

      {/* ==================================================
          STAFF ACTIVITY
      ================================================== */}

      {activeTab === "activity" && (
        <div className="staff-activity-section">

          {/* ACTIVITY SUMMARY */}

          <div className="staff-activity-summary">

            <div className="staff-summary-card">
              <span>Total Activities</span>

              <strong>
                {activitySummary.totalActivities}
              </strong>
            </div>

            <div className="staff-summary-card active">
              <span>Create Activities</span>

              <strong>
                {activitySummary.createActivities}
              </strong>
            </div>

            <div className="staff-summary-card salary">
              <span>Update Activities</span>

              <strong>
                {activitySummary.updateActivities}
              </strong>
            </div>

            <div className="staff-summary-card inactive">
              <span>Delete Activities</span>

              <strong>
                {activitySummary.deleteActivities}
              </strong>
            </div>

          </div>

          {/* ACTIVITY FILTERS */}

          <div className="staff-activity-filters">

            <select
              value={activityStaffFilter}
              onChange={(e) =>
                setActivityStaffFilter(
                  e.target.value
                )
              }
            >
              <option value="">
                All Staff
              </option>

              {staff.map((member) => (
                <option
                  key={member._id}
                  value={member._id}
                >
                  {member.name}
                </option>
              ))}
            </select>

            <select
              value={activityModuleFilter}
              onChange={(e) =>
                setActivityModuleFilter(
                  e.target.value
                )
              }
            >
              <option value="">
                All Modules
              </option>

              <option value="Customer">
                Customers
              </option>

              <option value="Supplier">
                Suppliers
              </option>

              <option value="Product">
                Products
              </option>

              <option value="Sale">
                Sales
              </option>

              <option value="Purchase">
                Purchases
              </option>

              <option value="Payment">
                Payments
              </option>
            </select>

            <select
              value={activityActionFilter}
              onChange={(e) =>
                setActivityActionFilter(
                  e.target.value
                )
              }
            >
              <option value="">
                All Actions
              </option>

              <option value="CREATE">
                Create
              </option>

              <option value="UPDATE">
                Update
              </option>

              <option value="DELETE">
                Delete
              </option>
            </select>

            <input
              type="date"
              value={activityFromDate}
              onChange={(e) =>
                setActivityFromDate(
                  e.target.value
                )
              }
              title="From date"
            />

            <input
              type="date"
              value={activityToDate}
              onChange={(e) =>
                setActivityToDate(
                  e.target.value
                )
              }
              title="To date"
            />

            <input
              type="text"
              value={activitySearch}
              onChange={(e) =>
                setActivitySearch(
                  e.target.value
                )
              }
              placeholder="Search activity..."
              className="staff-activity-search"
            />

            <button
              type="button"
              className="staff-activity-clear-btn"
              onClick={clearActivityFilters}
            >
              Clear Filters
            </button>

          </div>

          {/* ACTIVITY LIST */}

          <div className="staff-activity-list">

            {loading ? (
              <div className="staff-loading">
                Loading activities...
              </div>
            ) : activities.length === 0 ? (
              <div className="staff-empty">

                <div className="staff-empty-icon">
                  📋
                </div>

                <h3>
                  No staff business activities found
                </h3>

                <p>
                  Staff create, update and delete
                  operations will appear here.
                </p>

              </div>
            ) : (
              <div className="staff-table-wrapper">

                <table className="staff-table">

                  <thead>
                    <tr>
                      <th>Staff</th>
                      <th>Module</th>
                      <th>Action</th>
                      <th>Description</th>
                      <th>Reference</th>
                      <th>Amount</th>
                      <th>Date & Time</th>
                    </tr>
                  </thead>

                  <tbody>

                    {activities.map(
                      (activity) => (

                        <tr key={activity._id}>

                          <td>
                            <strong>
                              {activity.staffName ||
                                activity.user?.name ||
                                "-"}
                            </strong>

                            {activity.staffEmail && (
                              <small className="activity-staff-email">
                                {activity.staffEmail}
                              </small>
                            )}
                          </td>

                          <td>
                            {activity.module}
                          </td>

                          <td>
                            <span
                              className={`activity-action ${
                                activity.action
                                  ? activity.action.toLowerCase()
                                  : ""
                              }`}
                            >
                              {activity.action}
                            </span>
                          </td>

                          <td>
                            {activity.description ||
                              "-"}
                          </td>

                          <td>
                            {activity.invoiceNumber
                              ? activity.invoiceNumber
                              : activity.recordType
                              ? `${activity.recordType}`
                              : activity.recordId
                              ? String(
                                  activity.recordId
                                )
                              : "-"}
                          </td>

                          <td>
                            {activity.amount !==
                              null &&
                            activity.amount !==
                              undefined
                              ? formatMoney(
                                  activity.amount
                                )
                              : "-"}
                          </td>

                          <td>
                            {formatDateTime(
                              activity.createdAt
                            )}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default Staff;
