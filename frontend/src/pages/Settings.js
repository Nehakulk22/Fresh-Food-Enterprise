import React, { useEffect, useState } from "react";
import "./Settings.css";

const API_URL = "http://localhost:8000/api";

function Settings({ user, onLogin }) {
  const [activeSection, setActiveSection] =
    useState("business");

  const [loading, setLoading] = useState(false);

  const [businessForm, setBusinessForm] = useState({
    businessName: "FreshLedger",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    lowStockAlerts: true,
    paymentNotifications: true,
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ======================================================
  // AUTH HEADERS
  // ======================================================

  const getHeaders = () => {
    const token =
      localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  // ======================================================
  // LOAD SETTINGS
  // ======================================================

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/settings`,
        {
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load settings."
        );
      }

      if (data.settings) {
        setBusinessForm({
          businessName:
            data.settings.businessName ||
            "FreshLedger",

          businessEmail:
            data.settings.businessEmail ||
            "",

          businessPhone:
            data.settings.businessPhone ||
            "",

          businessAddress:
            data.settings.businessAddress ||
            "",

          currency:
            data.settings.currency ||
            "INR",

          dateFormat:
            data.settings.dateFormat ||
            "DD/MM/YYYY",

          lowStockAlerts:
            data.settings.lowStockAlerts !==
            false,

          paymentNotifications:
            data.settings
              .paymentNotifications !== false,
        });
      }

      if (data.user) {
        setProfileForm({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
        });
      }
    } catch (err) {
      console.error(
        "Load settings error:",
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // ======================================================
  // BUSINESS FORM CHANGE
  // ======================================================

  const handleBusinessChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setBusinessForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ======================================================
  // PROFILE FORM CHANGE
  // ======================================================

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // PASSWORD FORM CHANGE
  // ======================================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // UPDATE BUSINESS SETTINGS
  // ======================================================

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/settings/business`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(
            businessForm
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update settings."
        );
      }

      setMessage(
        "Business settings updated successfully."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // UPDATE PROFILE
  // ======================================================

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/settings/profile`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(
            profileForm
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update profile."
        );
      }

      setMessage(
        "Account profile updated successfully."
      );

      // Update localStorage user
      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        if (onLogin) {
          onLogin(data.user);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // CHANGE PASSWORD
  // ======================================================

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setError(
        "New password and confirm password do not match."
      );

      return;
    }

    if (
      passwordForm.newPassword.length < 6
    ) {
      setError(
        "New password must contain at least 6 characters."
      );

      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/settings/password`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(
            passwordForm
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to change password."
        );
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage(
        "Password changed successfully. Please login again."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // CLEAR MESSAGES
  // ======================================================

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  // ======================================================
  // RENDER BUSINESS
  // ======================================================

  const renderBusinessSettings = () => (
    <div className="settings-content-card">

      <div className="settings-content-header">

        <div>
          <h2>Business Profile</h2>

          <p>
            Manage your FreshLedger business information.
          </p>
        </div>

      </div>

      <form
        onSubmit={handleBusinessSubmit}
        className="settings-form"
      >

        <div className="settings-grid">

          <div className="settings-field">

            <label>
              Business Name *
            </label>

            <input
              type="text"
              name="businessName"
              value={
                businessForm.businessName
              }
              onChange={
                handleBusinessChange
              }
              placeholder="Enter business name"
              required
            />

          </div>

          <div className="settings-field">

            <label>
              Business Email
            </label>

            <input
              type="email"
              name="businessEmail"
              value={
                businessForm.businessEmail
              }
              onChange={
                handleBusinessChange
              }
              placeholder="business@example.com"
            />

          </div>

          <div className="settings-field">

            <label>
              Business Phone
            </label>

            <input
              type="tel"
              name="businessPhone"
              value={
                businessForm.businessPhone
              }
              onChange={
                handleBusinessChange
              }
              placeholder="Enter phone number"
            />

          </div>

          <div className="settings-field">

            <label>
              Currency
            </label>

            <select
              name="currency"
              value={
                businessForm.currency
              }
              onChange={
                handleBusinessChange
              }
            >

              <option value="INR">
                Indian Rupee (₹)
              </option>

              <option value="USD">
                US Dollar ($)
              </option>

              <option value="EUR">
                Euro (€)
              </option>

              <option value="GBP">
                British Pound (£)
              </option>

            </select>

          </div>

          <div className="settings-field">

            <label>
              Date Format
            </label>

            <select
              name="dateFormat"
              value={
                businessForm.dateFormat
              }
              onChange={
                handleBusinessChange
              }
            >

              <option value="DD/MM/YYYY">
                DD/MM/YYYY
              </option>

              <option value="MM/DD/YYYY">
                MM/DD/YYYY
              </option>

              <option value="YYYY-MM-DD">
                YYYY-MM-DD
              </option>

            </select>

          </div>

          <div className="settings-field settings-full">

            <label>
              Business Address
            </label>

            <textarea
              name="businessAddress"
              value={
                businessForm.businessAddress
              }
              onChange={
                handleBusinessChange
              }
              placeholder="Enter business address"
              rows="4"
            />

          </div>

        </div>

        <div className="settings-divider" />

        <div className="settings-options">

          <h3>
            Notifications
          </h3>

          <label className="settings-toggle-row">

            <div>

              <strong>
                Low Stock Alerts
              </strong>

              <span>
                Enable notifications when product stock reaches the low-stock threshold.
              </span>

            </div>

            <input
              type="checkbox"
              name="lowStockAlerts"
              checked={
                businessForm.lowStockAlerts
              }
              onChange={
                handleBusinessChange
              }
            />

          </label>

          <label className="settings-toggle-row">

            <div>

              <strong>
                Payment Notifications
              </strong>

              <span>
                Enable payment-related notifications.
              </span>

            </div>

            <input
              type="checkbox"
              name="paymentNotifications"
              checked={
                businessForm.paymentNotifications
              }
              onChange={
                handleBusinessChange
              }
            />

          </label>

        </div>

        <div className="settings-form-actions">

          <button
            type="submit"
            className="settings-primary-btn"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save Business Settings"}
          </button>

        </div>

      </form>

    </div>
  );

  // ======================================================
  // RENDER ACCOUNT
  // ======================================================

  const renderAccountSettings = () => (
    <div className="settings-content-card">

      <div className="settings-content-header">

        <div>
          <h2>Account Settings</h2>

          <p>
            Update your personal account information.
          </p>
        </div>

      </div>

      <form
        onSubmit={handleProfileSubmit}
        className="settings-form"
      >

        <div className="settings-grid">

          <div className="settings-field">

            <label>
              Full Name *
            </label>

            <input
              type="text"
              name="name"
              value={profileForm.name}
              onChange={
                handleProfileChange
              }
              placeholder="Enter your name"
              required
            />

          </div>

          <div className="settings-field">

            <label>
              Email Address *
            </label>

            <input
              type="email"
              name="email"
              value={profileForm.email}
              onChange={
                handleProfileChange
              }
              placeholder="Enter email address"
              required
            />

          </div>

          <div className="settings-field">

            <label>
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              value={profileForm.phone}
              onChange={
                handleProfileChange
              }
              placeholder="Enter phone number"
            />

          </div>

          <div className="settings-field">

            <label>
              Role
            </label>

            <input
              type="text"
              value={
                user?.role === "owner"
                  ? "Owner"
                  : "Staff"
              }
              disabled
            />

          </div>

          <div className="settings-field settings-full">

            <label>
              Address
            </label>

            <textarea
              name="address"
              value={
                profileForm.address
              }
              onChange={
                handleProfileChange
              }
              placeholder="Enter your address"
              rows="4"
            />

          </div>

        </div>

        <div className="settings-form-actions">

          <button
            type="submit"
            className="settings-primary-btn"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save Account Details"}
          </button>

        </div>

      </form>

    </div>
  );

  // ======================================================
  // RENDER SECURITY
  // ======================================================

  const renderSecuritySettings = () => (
    <div className="settings-content-card">

      <div className="settings-content-header">

        <div>
          <h2>Security</h2>

          <p>
            Change your account password.
          </p>
        </div>

      </div>

      <form
        onSubmit={handlePasswordSubmit}
        className="settings-form"
      >

        <div className="security-form">

          <div className="settings-field">

            <label>
              Current Password *
            </label>

            <input
              type="password"
              name="currentPassword"
              value={
                passwordForm.currentPassword
              }
              onChange={
                handlePasswordChange
              }
              placeholder="Enter current password"
              required
            />

          </div>

          <div className="settings-field">

            <label>
              New Password *
            </label>

            <input
              type="password"
              name="newPassword"
              value={
                passwordForm.newPassword
              }
              onChange={
                handlePasswordChange
              }
              placeholder="Enter new password"
              minLength="6"
              required
            />

            <small>
              Password must contain at least 6 characters.
            </small>

          </div>

          <div className="settings-field">

            <label>
              Confirm New Password *
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={
                passwordForm.confirmPassword
              }
              onChange={
                handlePasswordChange
              }
              placeholder="Confirm new password"
              minLength="6"
              required
            />

          </div>

        </div>

        <div className="settings-security-note">

          <strong>
            🔒 Security Notice
          </strong>

          <p>
            After changing your password, you should login again using your new password.
          </p>

        </div>

        <div className="settings-form-actions">

          <button
            type="submit"
            className="settings-primary-btn"
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Change Password"}
          </button>

        </div>

      </form>

    </div>
  );

  // ======================================================
  // RENDER PREFERENCES
  // ======================================================

  const renderPreferences = () => (
    <div className="settings-content-card">

      <div className="settings-content-header">

        <div>
          <h2>Application Preferences</h2>

          <p>
            Configure the way FreshLedger displays your business information.
          </p>
        </div>

      </div>

      <div className="preference-info-grid">

        <div className="preference-info-card">

          <div className="preference-icon">
            💰
          </div>

          <div>

            <h3>
              Currency
            </h3>

            <p>
              {businessForm.currency ===
              "INR"
                ? "Indian Rupee (₹)"
                : businessForm.currency}
            </p>

          </div>

        </div>

        <div className="preference-info-card">

          <div className="preference-icon">
            📅
          </div>

          <div>

            <h3>
              Date Format
            </h3>

            <p>
              {businessForm.dateFormat}
            </p>

          </div>

        </div>

      </div>

      <div className="settings-preference-note">

        <strong>
          Application Preferences
        </strong>

        <p>
          Currency and date format can be changed from the Business Profile section.
        </p>

        <button
          type="button"
          className="settings-secondary-btn"
          onClick={() => {
            clearMessages();
            setActiveSection("business");
          }}
        >
          Manage Preferences
        </button>

      </div>

    </div>
  );

  // ======================================================
  // RENDER SYSTEM INFO
  // ======================================================

  const renderSystemInfo = () => (
    <div className="settings-content-card">

      <div className="settings-content-header">

        <div>
          <h2>System Information</h2>

          <p>
            Information about your FreshLedger application.
          </p>
        </div>

      </div>

      <div className="system-info-list">

        <div className="system-info-row">
          <span>
            Application Name
          </span>

          <strong>
            FreshLedger
          </strong>
        </div>

        <div className="system-info-row">
          <span>
            Version
          </span>

          <strong>
            1.0.0
          </strong>
        </div>

        <div className="system-info-row">
          <span>
            Application Type
          </span>

          <strong>
            Business Management System
          </strong>
        </div>

        <div className="system-info-row">
          <span>
            Technology
          </span>

          <strong>
            MERN Stack
          </strong>
        </div>

        <div className="system-info-row">
          <span>
            Database
          </span>

          <strong>
            MongoDB
          </strong>
        </div>

        <div className="system-info-row">
          <span>
            Current User
          </span>

          <strong>
            {user?.name || "User"}
          </strong>
        </div>

        <div className="system-info-row">
          <span>
            Account Role
          </span>

          <strong>
            {user?.role === "owner"
              ? "Owner"
              : "Staff"}
          </strong>
        </div>

      </div>

    </div>
  );

  // ======================================================
  // MAIN RENDER
  // ======================================================

  return (
    <div className="settings-page">

      {/* HEADER */}

      <div className="settings-page-header">

        <div>

          <h1>
            Settings
          </h1>

          <p>
            Manage your account and FreshLedger preferences.
          </p>

        </div>

      </div>

      {/* MESSAGES */}

      {message && (
        <div className="settings-success-message">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="settings-error-message">
          ⚠ {error}
        </div>
      )}

      {/* SETTINGS LAYOUT */}

      <div className="settings-layout">

        {/* SIDEBAR */}

        <div className="settings-navigation">

          <button
            className={
              activeSection === "business"
                ? "settings-nav-item active"
                : "settings-nav-item"
            }
            onClick={() => {
              clearMessages();
              setActiveSection("business");
            }}
          >
            <span className="settings-nav-icon">
              🏢
            </span>

            <span>
              Business Profile
            </span>
          </button>

          <button
            className={
              activeSection === "account"
                ? "settings-nav-item active"
                : "settings-nav-item"
            }
            onClick={() => {
              clearMessages();
              setActiveSection("account");
            }}
          >
            <span className="settings-nav-icon">
              👤
            </span>

            <span>
              Account Settings
            </span>
          </button>

          <button
            className={
              activeSection === "security"
                ? "settings-nav-item active"
                : "settings-nav-item"
            }
            onClick={() => {
              clearMessages();
              setActiveSection("security");
            }}
          >
            <span className="settings-nav-icon">
              🔒
            </span>

            <span>
              Security
            </span>
          </button>

          <button
            className={
              activeSection === "preferences"
                ? "settings-nav-item active"
                : "settings-nav-item"
            }
            onClick={() => {
              clearMessages();
              setActiveSection("preferences");
            }}
          >
            <span className="settings-nav-icon">
              ⚙️
            </span>

            <span>
              Preferences
            </span>
          </button>

          <button
            className={
              activeSection === "system"
                ? "settings-nav-item active"
                : "settings-nav-item"
            }
            onClick={() => {
              clearMessages();
              setActiveSection("system");
            }}
          >
            <span className="settings-nav-icon">
              ℹ️
            </span>

            <span>
              System Information
            </span>
          </button>

        </div>

        {/* CONTENT */}

        <div className="settings-main-content">

          {activeSection ===
            "business" &&
            renderBusinessSettings()}

          {activeSection ===
            "account" &&
            renderAccountSettings()}

          {activeSection ===
            "security" &&
            renderSecuritySettings()}

          {activeSection ===
            "preferences" &&
            renderPreferences()}

          {activeSection ===
            "system" &&
            renderSystemInfo()}

        </div>

      </div>

    </div>
  );
}

export default Settings;