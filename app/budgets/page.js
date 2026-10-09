"use client";

import { useEffect, useState } from "react";

export default function BudgetsPage() {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState("");
  const [savedBudget, setSavedBudget] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch("/api/expenses");
        const data = await response.json();

        if (data.success) {
          setExpenses(data.expenses);
        }
      } catch (error) {
        console.error("Failed to load budget data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();

    const storedBudget = localStorage.getItem("monthlyBudget");

    if (storedBudget) {
      setSavedBudget(Number(storedBudget));
    }
  }, []);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthlyExpenses = expenses.filter((expense) => {
    const date = new Date(expense.date);

    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  });

  const monthlySpending = monthlyExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const remaining = savedBudget - monthlySpending;

  const percentage =
    savedBudget > 0
      ? Math.min((monthlySpending / savedBudget) * 100, 100)
      : 0;

  const handleSaveBudget = () => {
    const amount = Number(budget);

    if (!amount || amount <= 0) {
      return;
    }

    localStorage.setItem("monthlyBudget", amount);
    setSavedBudget(amount);
    setBudget("");
  };

  if (loading) {
    return (
      <main className="budgets-page">
        <div className="transactions-loading">
          Loading budget...
        </div>
      </main>
    );
  }

  return (
    <main className="budgets-page">

      {/* HEADER */}

      <div className="budgets-header">
        <span className="budgets-eyebrow">
          BUDGETS
        </span>

        <h1>Monthly Budget</h1>

        <p>
          Set a spending limit and keep track of your monthly progress.
        </p>
      </div>

      {/* OVERVIEW */}

      <div className="budget-section-label">
        BUDGET OVERVIEW
      </div>

      <div className="budget-overview">

        <div className="budget-card budget-main-card">

          <div className="budget-card-top">
            <h2>Current Month</h2>

            <div className="budget-icon">
              Rs
            </div>
          </div>

          <div className="budget-main-amount">
            &#8377;{monthlySpending.toFixed(0)}
          </div>

          <div className="budget-main-subtitle">
            spent this month
          </div>

          <div className="budget-progress-section">

            <div className="budget-progress-label">
              <span>
                Budget usage
              </span>

              <strong>
                {percentage.toFixed(0)}%
              </strong>
            </div>

            <div className="budget-progress-track">
              <div
                className="budget-progress-fill"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>

          </div>

        </div>

        <div className="budget-card budget-main-card">

          <div className="budget-card-top">
            <h2>
              {savedBudget > 0
                ? "Remaining Budget"
                : "Monthly Budget"}
            </h2>

            <div className="budget-icon">
              B
            </div>
          </div>

          <div className="budget-main-amount">
            &#8377;
            {savedBudget > 0
              ? Math.max(remaining, 0).toFixed(0)
              : "0"}
          </div>

          <div className="budget-main-subtitle">
            {savedBudget > 0
              ? remaining >= 0
                ? "available to spend"
                : "budget exceeded"
              : "set your monthly limit below"}
          </div>

        </div>

      </div>

      {/* SETTINGS */}

      <div className="budget-section-label">
        BUDGET SETTINGS
      </div>

      <section className="budget-settings-card">

        <h2>Set Monthly Budget</h2>

        <p>
          Choose the maximum amount you want to spend this month.
        </p>

        <div className="budget-input-row">

          <div className="budget-input-wrapper">

            <span>
              &#8377;
            </span>

            <input
              type="number"
              min="1"
              placeholder={
                savedBudget > 0
                  ? savedBudget.toString()
                  : "Enter budget amount"
              }
              value={budget}
              onChange={(event) =>
                setBudget(event.target.value)
              }
            />

          </div>

          <button
            className="budget-save-button"
            onClick={handleSaveBudget}
          >
            Save Budget
          </button>

        </div>

      </section>

    </main>
  );
}