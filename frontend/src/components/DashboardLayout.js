import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";

import "./Sidebar.css";
import "./DashboardLayout.css";

function DashboardLayout({ user, onLogout }) {
  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        onLogout={onLogout}
      />

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;