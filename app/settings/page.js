"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

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
    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  return (
    <main className="settings-page">

      <div className="settings-header">
        <span className="settings-badge">? SETTINGS</span>

        <h1>Settings</h1>

        <p>
          Manage your account and application preferences.
        </p>
      </div>

      {/* ACCOUNT */}
      <section className="settings-section">

        <div className="settings-section-heading">
          <h2>Account</h2>
          <p>Your account information</p>
        </div>

        <div className="settings-card">

          <div className="settings-profile">

            <div className="settings-avatar">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : "U"}
            </div>

            <div>
              <h3>{user?.name || "Loading..."}</h3>

              <p>
                {user?.email || "Loading email..."}
              </p>
            </div>

          </div>

          <div className="settings-row">

            <div className="settings-row-icon">
              ??
            </div>

            <div className="settings-row-content">
              <strong>Profile</strong>

              <span>
                Your name and email address
              </span>
            </div>

            <button
              className="settings-secondary-button"
              disabled
            >
              Coming soon
            </button>

          </div>

        </div>

      </section>

      {/* SECURITY */}
      <section className="settings-section">

        <div className="settings-section-heading">
          <h2>Security</h2>
          <p>Keep your account secure</p>
        </div>

        <div className="settings-card">

          <div className="settings-row">

            <div className="settings-row-icon">
              ??
            </div>

            <div className="settings-row-content">

              <strong>Change Password</strong>

              <span>
                Update your account password
              </span>

            </div>

            <button
              className="settings-secondary-button"
              disabled
            >
              Coming soon
            </button>

          </div>

        </div>

      </section>

      {/* PREFERENCES */}
      <section className="settings-section">

        <div className="settings-section-heading">
          <h2>Preferences</h2>
          <p>Customize your experience</p>
        </div>

        <div className="settings-card">

          <div className="settings-row">

            <div className="settings-row-icon">
              ??
            </div>

            <div className="settings-row-content">

              <strong>Currency</strong>

              <span>
                Currency used throughout the application
              </span>

            </div>

            <span className="settings-value">
              ? INR
            </span>

          </div>

          <div className="settings-divider" />

          <div className="settings-row">

            <div className="settings-row-icon">
              ??
            </div>

            <div className="settings-row-content">

              <strong>Appearance</strong>

              <span>
                Current application theme
              </span>

            </div>

            <span className="settings-value">
              Dark
            </span>

          </div>

        </div>

      </section>

      {/* DATA & PRIVACY */}
      <section className="settings-section">

        <div className="settings-section-heading">
          <h2>Data & Privacy</h2>
          <p>Manage your expense data</p>
        </div>

        <div className="settings-card">

          <div className="settings-row">

            <div className="settings-row-icon">
              ??
            </div>

            <div className="settings-row-content">

              <strong>Export Data</strong>

              <span>
                Download your expense data
              </span>

            </div>

            <button
              className="settings-secondary-button"
              disabled
            >
              Coming soon
            </button>

          </div>

          <div className="settings-divider" />

          <div className="settings-row">

            <div className="settings-row-icon">
              ???
            </div>

            <div className="settings-row-content">

              <strong>Delete Data</strong>

              <span>
                Permanently delete your expenses
              </span>

            </div>

            <button
              className="settings-danger-button"
              disabled
            >
              Coming soon
            </button>

          </div>

        </div>

      </section>

      {/* ACCOUNT ACTIONS */}
      <section className="settings-section">

        <div className="settings-section-heading">
          <h2>Account Actions</h2>
          <p>Manage your current session</p>
        </div>

        <div className="settings-card">

          <div className="settings-row">

            <div className="settings-row-icon">
              ??
            </div>

            <div className="settings-row-content">

              <strong>Log Out</strong>

              <span>
                Sign out of your ExpenseTracker account
              </span>

            </div>

            <button
              className="settings-logout-button"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut
                ? "Logging out..."
                : "Log Out"}
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}
