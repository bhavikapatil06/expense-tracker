"use client";

export default function Navbar() {
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
    <nav>
      <h2>ExpenseTracker</h2>

      <div>
        <span>Dashboard</span>
        <span>Expenses</span>
        <span>Profile</span>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}