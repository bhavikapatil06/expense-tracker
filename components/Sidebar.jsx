"use client";

import { useEffect, useState } from "react";

export default function Sidebar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST"
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleComingSoon = (name) => {
    alert(`${name} feature is coming soon.`);
  };

  return (
    <aside className="sidebar">

      {/* BRAND */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">₹</div>

        <div>
          <h2>ExpenseTracker</h2>
          <span>Smart finance</span>
        </div>
      </div>

      {/* USER */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">
  👤
</div>

        <h3>Welcome!</h3>

        <p>
          {user?.name
            ? `Manage your finances, ${user.name}`
            : "Manage your finances"}
        </p>
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav">

        <a
          href="/"
          className="sidebar-nav-item active"
        >
          <span className="sidebar-nav-icon">⌂</span>
          <span>Dashboard</span>
        </a>

        <button
          className="sidebar-nav-item"
          onClick={() => handleComingSoon("Transactions")}
        >
          <span className="sidebar-nav-icon">⇄</span>
          <span>Transactions</span>
        </button>

        <button
          className="sidebar-nav-item"
          onClick={() => handleComingSoon("Analytics")}
        >
          <span className="sidebar-nav-icon">◔</span>
          <span>Analytics</span>
        </button>

        <button
          className="sidebar-nav-item"
          onClick={() => handleComingSoon("Budgets")}
        >
          <span className="sidebar-nav-icon">◉</span>
          <span>Budgets</span>
        </button>

        <a
  href="/settings"
  className="sidebar-nav-item"
>
  <span className="sidebar-nav-icon">⚙</span>
  <span>Settings</span>
</a>

      </nav>

      {/* BOTTOM */}
      <div className="sidebar-bottom">

        <button
          className="export-button"
          onClick={() => handleComingSoon("Export Data")}
        >
          <span>↓</span>
          <span>Export Data</span>
        </button>

        

      </div>

    </aside>
  );
}