"use client";

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">₹</div>

        <div>
          <h2>ExpenseTracker</h2>
          <span>Smart finance</span>
        </div>
      </div>

      <div className="sidebar-profile">
        <div className="sidebar-avatar">👤</div>
        <h3>Welcome!</h3>
        <p>Manage your finances</p>
      </div>

      <nav className="sidebar-nav">

        <a href="#dashboard" className="sidebar-link active">
          <span>⌂</span>
          Dashboard
        </a>

        <a href="#expenses" className="sidebar-link">
          <span>⇄</span>
          Transactions
        </a>

        <a href="#analytics" className="sidebar-link">
          <span>◔</span>
          Analytics
        </a>

        <a href="#budgets" className="sidebar-link">
          <span>◉</span>
          Budgets
        </a>

        <a href="#settings" className="sidebar-link">
          <span>⚙</span>
          Settings
        </a>

      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-export">
          ⇩ Export Data
        </button>
      </div>

    </aside>
  );
}