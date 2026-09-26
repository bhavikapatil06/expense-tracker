"use client";

import { useEffect, useState } from "react";
import Toast from "./Toast";
import ExpenseCard from "./ExpenseCard";
import ExpenseForm from "./ExpenseForm";

export default function Dashboard() {
  const [editingExpense, setEditingExpense] = useState(null);

  const [toast, setToast] = useState({
    message: "",
    type: "success"
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [expenses, setExpenses] = useState([]);

  // Load expenses from MongoDB when the page opens
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch("/api/expenses");
        const data = await response.json();

         if (data.success) {
  setExpenses(data.expenses);
}
      } catch (error) {
        console.error("Failed to fetch expenses:", error);

        setToast({
          message: "Failed to load expenses.",
          type: "error"
        });
      }
    };

    fetchExpenses();
  }, []);

  // Add a new expense to MongoDB
  const handleAddExpense = async (newExpense) => {
    // Edit will be connected to the backend in the next step
    if (editingExpense) {
  try {
    const response = await fetch(
      `/api/expenses/${editingExpense.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newExpense)
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to update expense");
    }

    setExpenses((currentExpenses) =>
      currentExpenses.map((expense) =>
        expense.id === editingExpense.id
          ? {
              ...expense,
              description: newExpense.description,
              amount: newExpense.amount,
              category: newExpense.category,
              date: newExpense.date
            }
          : expense
      )
    );

    setEditingExpense(null);

    setToast({
      message: "Expense updated successfully!",
      type: "success"
    });

    return;
  } catch (error) {
    console.error("Failed to update expense:", error);

    setToast({
      message: "Failed to update expense.",
      type: "error"
    });

    return;
  }
}
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newExpense)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to save expense");
      }

      const savedExpense = {
        ...newExpense,
        id: data.expenseId
      };

      setExpenses((currentExpenses) => [
        ...currentExpenses,
        savedExpense
      ]);

      setToast({
        message: "Expense added successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Failed to save expense:", error);

      setToast({
        message: "Failed to save expense.",
        type: "error"
      });
    }
  };

  // Delete expense from the current frontend state
  // Backend DELETE will be connected in the next step
  const handleDeleteExpense = async (id) => {
  try {
    const response = await fetch(`/api/expenses/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to delete expense");
    }

    setExpenses((currentExpenses) =>
      currentExpenses.filter((expense) => expense.id !== id)
    );

    setToast({
      message: "Expense deleted successfully!",
      type: "success"
    });
  } catch (error) {
    console.error("Failed to delete expense:", error);

    setToast({
      message: "Failed to delete expense.",
      type: "error"
    });
  }
};

  const handleEditExpense = (id) => {
    const expenseToEdit = expenses.find(
      (expense) => expense.id === id
    );

    setEditingExpense(expenseToEdit);
  };

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

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

  const categoryTotals = expenses.reduce(
    (totals, expense) => {
      if (!totals[expense.category]) {
        totals[expense.category] = 0;
      }

      totals[expense.category] += expense.amount;

      return totals;
    },
    {}
  );

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
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() =>
          setToast({
            message: "",
            type: "success"
          })
        }
      />

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

      <ExpenseForm
        onAddExpense={handleAddExpense}
        editingExpense={editingExpense}
      />

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
                    : 0}
                  %
                </span>
              </strong>
            </div>

            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{
                  width:
                    totalExpenses > 0
                      ? `${(total / totalExpenses) * 100}%`
                      : "0%"
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-expenses">
        <h2>Recent Expenses</h2>

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

            <p>
              Try changing your search or filter.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}