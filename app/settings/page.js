"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [loggingOut, setLoggingOut] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);


  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [userResponse, expensesResponse] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/expenses"),
        ]);

        const userData = await userResponse.json();
        const expenseData = await expensesResponse.json();

        if (userData.success) {
          setUser(userData.user);
          setProfileName(userData.user.name || "");
          setProfileEmail(userData.user.email || "");
        }

        if (expenseData.success) {
          setExpenses(expenseData.expenses);
        }

        
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // UPDATE PROFILE
  const handleSaveProfile = async () => {
    if (!profileName.trim() || !profileEmail.trim()) {
      window.alert("Name and email are required.");
      return;
    }

    try {
      setSavingProfile(true);

      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        window.alert(data.message || "Failed to update profile.");
        return;
      }

      setUser(data.user);
      setProfileName(data.user.name);
      setProfileEmail(data.user.email);
      setEditingProfile(false);

      window.alert("Profile updated successfully.");
    } catch (error) {
      console.error("Update profile failed:", error);
      window.alert("Something went wrong while updating your profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // CHANGE PASSWORD
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      window.alert("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      window.alert("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      window.alert("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      window.alert(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setSavingPassword(true);

      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        window.alert(data.message || "Failed to change password.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingPassword(false);

      window.alert("Password changed successfully.");
    } catch (error) {
      console.error("Change password failed:", error);
      window.alert("Something went wrong while changing your password.");
    } finally {
      setSavingPassword(false);
    }
  };

  

  // EXPORT DATA
  const handleExport = () => {
    if (expenses.length === 0) {
      window.alert("There are no expenses to export.");
      return;
    }

    const headers = [
      "Date",
      "Name",
      "Description",
      "Category",
      "Amount",
    ];

    const rows = expenses.map((expense) => [
      expense.date || "",
      expense.name || "",
      expense.description || "",
      expense.category || "",
      Number(expense.amount || 0).toFixed(2),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "expense-tracker-data.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // DELETE ALL DATA
  const handleDeleteData = async () => {
    if (expenses.length === 0) {
      window.alert("You do not have any expense data to delete.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete all your expense data? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const results = await Promise.all(
        expenses.map((expense) =>
          fetch(`/api/expenses/${expense.id}`, {
            method: "DELETE",
          })
        )
      );

      const failed = results.some((response) => !response.ok);

      if (failed) {
        window.alert(
          "Some expenses could not be deleted. Please try again."
        );
        return;
      }

      setExpenses([]);

      window.alert("All your expense data has been deleted.");
    } catch (error) {
      console.error("Delete data failed:", error);

      window.alert(
        "Something went wrong while deleting your data."
      );
    } finally {
      setDeleting(false);
    }
  };

  // LOGOUT
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

  // LOADING
  if (loading) {
    return (
      <main className="settings-page">
        <div className="transactions-loading">
          Loading settings...
        </div>
      </main>
    );
  }

  return (
    <main className="settings-page">
      {/* HEADER */}
      <div className="settings-header">
        <span className="settings-badge">SETTINGS</span>
        <h1>Settings</h1>
        <p>Manage your account and application preferences.</p>
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
              <h3>{user?.name || "User"}</h3>
              <p>{user?.email || "No email available"}</p>
            </div>
          </div>

          {!editingProfile ? (
            <div className="settings-row">
              <div className="settings-row-icon">P</div>

              <div className="settings-row-content">
                <strong>Profile</strong>
                <span>
                  Your registered name and email address
                </span>
              </div>

              <button
                className="settings-secondary-button"
                onClick={() => setEditingProfile(true)}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="settings-profile-edit">
              <div className="settings-input-group">
                <label>Name</label>

                <input
                  type="text"
                  value={profileName}
                  onChange={(event) =>
                    setProfileName(event.target.value)
                  }
                  placeholder="Enter your name"
                />
              </div>

              <div className="settings-input-group">
                <label>Email</label>

                <input
                  type="email"
                  value={profileEmail}
                  onChange={(event) =>
                    setProfileEmail(event.target.value)
                  }
                  placeholder="Enter your email"
                />
              </div>

              <div className="settings-profile-actions">
                <button
                  className="settings-secondary-button"
                  onClick={() => {
                    setProfileName(user?.name || "");
                    setProfileEmail(user?.email || "");
                    setEditingProfile(false);
                  }}
                  disabled={savingProfile}
                >
                  Cancel
                </button>

                <button
                  className="settings-primary-button"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECURITY */}
      <section className="settings-section">
        <div className="settings-section-heading">
          <h2>Security</h2>
          <p>Keep your account secure</p>
        </div>

        <div className="settings-card">
          {!changingPassword ? (
            <div className="settings-row">
              <div className="settings-row-icon">S</div>

              <div className="settings-row-content">
                <strong>Change Password</strong>
                <span>
                  Update your account password
                </span>
              </div>

              <button
                className="settings-secondary-button"
                onClick={() => setChangingPassword(true)}
              >
                Change Password
              </button>
            </div>
          ) : (
            <div className="settings-profile-edit">
              <div className="settings-input-group">
                <label>Current Password</label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  placeholder="Enter current password"
                />
              </div>

              <div className="settings-input-group">
                <label>New Password</label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  placeholder="Enter new password"
                />
              </div>

              <div className="settings-input-group">
                <label>Confirm New Password</label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm new password"
                />
              </div>

              <div className="settings-profile-actions">
                <button
                  className="settings-secondary-button"
                  onClick={() => {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setChangingPassword(false);
                  }}
                  disabled={savingPassword}
                >
                  Cancel
                </button>

                <button
                  className="settings-primary-button"
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                >
                  {savingPassword
                    ? "Changing..."
                    : "Update Password"}
                </button>
              </div>
            </div>
          )}
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
            <div className="settings-row-icon">E</div>

            <div className="settings-row-content">
              <strong>Export Data</strong>
              <span>
                Download all your expenses as a CSV file
              </span>
            </div>

            <button
              className="settings-secondary-button"
              onClick={handleExport}
            >
              Export CSV
            </button>
          </div>

          <div className="settings-divider" />

          <div className="settings-row">
            <div className="settings-row-icon">D</div>

            <div className="settings-row-content">
              <strong>Delete Data</strong>
              <span>
                Permanently delete all your expenses
              </span>
            </div>

            <button
              className="settings-danger-button"
              onClick={handleDeleteData}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Data"}
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
            <div className="settings-row-icon">L</div>

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
              {loggingOut ? "Logging out..." : "Log Out"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}