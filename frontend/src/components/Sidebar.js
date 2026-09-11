import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import logo from "./im1.png";

function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/dashboard",
      icon: "📊",
      label: "Dashboard",
    },
    {
      path: "/customers",
      icon: "👥",
      label: "Customers",
    },
    {
      path: "/suppliers",
      icon: "🚚",
      label: "Suppliers",
    },
    {
      path: "/products",
      icon: "📦",
      label: "Products",
    },
    {
      path: "/sales",
      icon: "💰",
      label: "Sales",
    },
    {
      path: "/purchases",
      icon: "🛒",
      label: "Purchases",
    },
    {
      path: "/payments",
      icon: "💳",
      label: "Payments",
    },
    {
      path: "/reports",
      icon: "📈",
      label: "Reports",
    },
    {
      path: "/staff",
      icon: "👤",
      label: "Staff",
    },
    {
      path: "/settings",
      icon: "⚙️",
      label: "Settings",
    },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <img
            src={logo}
            alt="Fresh Food Enterprises Logo"
          />
        </div>

        <div className="sidebar-brand-text">
          <h2>Fresh Food</h2>
          <p>Enterprises</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-menu-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="sidebar-menu-icon">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "O"}
          </div>

          <div className="user-info">
            <strong>{user?.name || "Owner"}</strong>
            <span>Owner</span>
          </div>
        </div>

        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;