"use client";

import { useState } from "react";
import ExpenseCard from "./ExpenseCard";
import ExpenseForm from "./ExpenseForm";

export default function Dashboard() {
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [expenses, setExpenses] = useState([
    {
      id: 1,
      category: "Food",
      description: "Dinner",
      amount: 450,
      date: "2026-09-08"
    },
    {
      id: 2,
      category: "Transport",
      description: "Bus ticket",
      amount: 120,
      date: "2026-09-07"
    },
    {
      id: 3,
      category: "Shopping",
      description: "Clothes",
      amount: 800,
      date: "2026-09-05"
    }
  ]);

  // Add or update expense
  const handleAddExpense = (newExpense) => {
    if (editingExpense) {
      setExpenses((currentExpenses) =>
        currentExpenses.map((expense) =>
          expense.id === newExpense.id
            ? newExpense
            : expense
        )
      );

      setEditingExpense(null);
    } else {
      setExpenses((currentExpenses) => [
        ...currentExpenses,
        newExpense
      ]);
    }
  };

  // Delete expense
  const handleDeleteExpense = (id) => {
    setExpenses((currentExpenses) =>
      currentExpenses.filter((expense) => expense.id !== id)
    );
  };

  // Edit expense
  const handleEditExpense = (id) => {
    const expenseToEdit = expenses.find(
      (expense) => expense.id === id
    );

    setEditingExpense(expenseToEdit);
  };

  // Calculate total expenses
  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  // Calculate current month total
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTotal = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);

      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    })
    .reduce((total, expense) => total + expense.amount, 0);

  // Search and category filtering
   const categoryTotals = expenses.reduce((totals, expense) => {
  if (!totals[expense.category]) {
    totals[expense.category] = 0;
  }

  totals[expense.category] += expense.amount;

  return totals;
}, {});
  
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" ||
      expense.category.includes(categoryFilter);

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="dashboard">

      {/* Welcome Section */}
      <div className="welcome">
  <div className="welcome-badge">
    ✨ Personal Finance Dashboard
  </div>

  <h1>
    Take control of your <span>money</span> 💰
  </h1>

  <p>
    Track your spending, understand your habits, and make smarter
    financial decisions.
  </p>
</div>

      {/* Expense Form */}
      <ExpenseForm
        onAddExpense={handleAddExpense}
        editingExpense={editingExpense}
      />

      {/* Summary Cards */}
      <div className="summary">

  <div className="card">
    <div className="card-icon">💸</div>

    <p>Total Expenses</p>

    <h2>₹{totalExpenses}</h2>

    <span className="card-description">
      Your overall spending
    </span>
  </div>

  <div className="card">
    <div className="card-icon">📅</div>

    <p>This Month</p>

    <h2>₹{monthlyTotal}</h2>

    <span className="card-description">
      Spending this month
    </span>
  </div>

  <div className="card">
    <div className="card-icon">🧾</div>

    <p>Total Transactions</p>

    <h2>{expenses.length}</h2>

    <span className="card-description">
      Recorded expenses
    </span>
  </div>

</div>
      {/* Recent Expenses */}
      <div className="expense-statistics">

  <h2>Expense Breakdown</h2>

  {Object.entries(categoryTotals).map(([category, total]) => (
    <div className="stat-row" key={category}>

      <div className="stat-info">
  <span>{category}</span>

  <strong>
    ₹{total}{" "}
    <span className="stat-percentage">
      {totalExpenses > 0
        ? ((total / totalExpenses) * 100).toFixed(1)
        : 0}%
    </span>
  </strong>
</div>

      <div className="stat-bar">
        <div
          className="stat-bar-fill"
          style={{
            width: `${(total / totalExpenses) * 100}%`
          }}
        ></div>
      </div>

    </div>
  ))}

</div>
      <div className="recent-expenses">

        <h2>Recent Expenses</h2>

        {/* Search and Filter */}
        <div className="expense-filters">

          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Bills">Bills</option>
          </select>

        </div>

        {/* Expense List */}
        {filteredExpenses.length > 0 ? (
  filteredExpenses.map((expense) => (
    <ExpenseCard
      key={expense.id}
      id={expense.id}
      category={expense.category}
      description={expense.description}
      amount={expense.amount}
      date={expense.date}
      onDelete={handleDeleteExpense}
      onEdit={handleEditExpense}
    />
  ))
) : (
  <div className="empty-state">
    <div className="empty-icon">🔍</div>
    <h3>No expenses found</h3>
    <p>Try changing your search or filter.</p>
  </div>
)}
      </div>

    </section>
  );
}