import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

import DashboardLayout from "./components/DashboardLayout";

import OwnerDashboard from "./pages/OwnerDashboard";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
<<<<<<< Updated upstream
=======
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Staff from "./pages/Staff";
import Settings from "./components/Settings";
>>>>>>> Stashed changes

import "./components/auth/Auth.css";

import "./components/Sidebar.css";
import "./components/DashboardLayout.css";

import "./pages/OwnerDashboard.css";
import "./pages/Customers.css";
import "./pages/Suppliers.css";
import "./pages/Products.css";
import "./pages/Sales.css";
import "./pages/Purchases.css";
<<<<<<< Updated upstream
=======
import "./pages/Payments.css";
import "./components/Settings.css";
>>>>>>> Stashed changes

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>

<<<<<<< Updated upstream
        {/* LOGIN */}
=======
        {/* =====================================================
            LOGIN
        ====================================================== */}
>>>>>>> Stashed changes
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login
                onLogin={handleLogin}
              />
            )
          }
        />

<<<<<<< Updated upstream
        {/* SIGNUP */}
=======
        {/* =====================================================
            SIGNUP
        ====================================================== */}
>>>>>>> Stashed changes
        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Signup />
            )
          }
        />

<<<<<<< Updated upstream
        {/* LOGGED-IN PAGES */}
=======
        {/* =====================================================
            LOGGED-IN PAGES
        ====================================================== */}
>>>>>>> Stashed changes
        {user ? (
          <Route
            element={
              <DashboardLayout
                user={user}
                onLogout={handleLogout}
              />
            }
          >
<<<<<<< Updated upstream
            <Route
              path="/dashboard"
              element={
                <OwnerDashboard user={user} />
              }
            />

            <Route
              path="/customers"
              element={<Customers />}
            />

            <Route
              path="/suppliers"
              element={<Suppliers />}
            />

            <Route
              path="/products"
              element={<Products />}
            />

            <Route
              path="/sales"
              element={<Sales />}
            />

            <Route
              path="/purchases"
              element={<Purchases />}
            />

            {/* Future Modules */}

            <Route
              path="/payments"
              element={
                <ModuleComingSoon
                  title="Payments"
=======

            {/* DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                <OwnerDashboard user={user} />
              }
            />

            {/* CUSTOMERS */}
            <Route
              path="/customers"
              element={<Customers />}
            />

            {/* SUPPLIERS */}
            <Route
              path="/suppliers"
              element={<Suppliers />}
            />

            {/* PRODUCTS */}
            <Route
              path="/products"
              element={<Products />}
            />

            {/* SALES */}
            <Route
              path="/sales"
              element={<Sales />}
            />

            {/* PURCHASES */}
            <Route
              path="/purchases"
              element={<Purchases />}
            />

            {/* PAYMENTS */}
            <Route
              path="/payments"
              element={<Payments />}
            />

            {/* REPORTS */}
            <Route
              path="/reports"
              element={<Reports />}
            />

            {/* STAFF */}
            <Route
              path="/staff"
              element={<Staff />}
            />

            {/* SETTINGS */}
            <Route
              path="/settings"
              element={
                <Settings
                  user={user}
                  onLogin={handleLogin}
>>>>>>> Stashed changes
                />
              }
            />

<<<<<<< Updated upstream
            <Route
              path="/reports"
              element={
                <ModuleComingSoon
                  title="Reports"
                />
              }
            />

            <Route
              path="/staff"
              element={
                <ModuleComingSoon
                  title="Staff Management"
                />
              }
            />

            <Route
              path="/settings"
              element={
                <ModuleComingSoon
                  title="Settings"
                />
              }
            />
          </Route>
        ) : (
          /* NOT LOGGED IN */
=======
          </Route>
        ) : (
          /* =====================================================
             NOT LOGGED IN
          ====================================================== */
>>>>>>> Stashed changes
          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />
        )}

<<<<<<< Updated upstream
        {/* FALLBACK */}
=======
        {/* =====================================================
            FALLBACK
        ====================================================== */}
>>>>>>> Stashed changes
        <Route
          path="*"
          element={
            <Navigate
              to={user ? "/dashboard" : "/login"}
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
<<<<<<< Updated upstream
  );
}


/* Temporary pages for modules
   that we will build later.
*/

function ModuleComingSoon({ title }) {
  return (
    <div
      style={{
        padding: "40px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "40px",
          textAlign: "center",
          border: "1px solid #e5e7eb",
        }}
      >
        <h1
          style={{
            color: "#16823b",
            marginBottom: "10px",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            color: "#777",
          }}
        >
          This module will be available soon.
        </p>
      </div>
    </div>
=======
>>>>>>> Stashed changes
  );
}

export default App;