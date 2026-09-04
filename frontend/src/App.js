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

import "./components/auth/Auth.css";

import "./components/Sidebar.css";
import "./components/DashboardLayout.css";

import "./pages/OwnerDashboard.css";
import "./pages/Customers.css";
import "./pages/Suppliers.css";
import "./pages/Products.css";
import "./pages/Sales.css";
import "./pages/Purchases.css";

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

        {/* LOGIN */}
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

        {/* SIGNUP */}
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

        {/* LOGGED-IN PAGES */}
        {user ? (
          <Route
            element={
              <DashboardLayout
                user={user}
                onLogout={handleLogout}
              />
            }
          >
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
                />
              }
            />

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

        {/* FALLBACK */}
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
  );
}

export default App;