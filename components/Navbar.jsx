"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
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
    const response = await fetch("/api/auth/logout", {
      method: "POST"
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = "/login";
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">₹</div>

        <div>
          <h2>ExpenseTracker</h2>
          <span>Smart money management</span>
        </div>
      </div>

      <div className="navbar-actions">
        <span className="navbar-dashboard">
          Dashboard
        </span>

        {user && (
          <div className="navbar-user">
  <div className="user-avatar">
    {user.name.charAt(0).toUpperCase()}
  </div>

  <strong>{user.name}</strong>
</div>
        )}

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}