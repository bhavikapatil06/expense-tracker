"use client";

import { useEffect, useState } from "react";

export default function TransactionsPage() {
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
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
        console.error("Failed to load transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  // =========================
  // FILTER TRANSACTIONS
  // =========================

  const filteredExpenses = expenses
    .filter((expense) => {
      const search = searchTerm.toLowerCase();

      return (
        expense.name?.toLowerCase().includes(search) ||
        expense.description?.toLowerCase().includes(search) ||
        expense.category?.toLowerCase().includes(search)
      );
    })
    .filter((expense) => {
      if (categoryFilter === "All") {
        return true;
      }

      return expense.category === categoryFilter;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // =========================
  // TOTAL
  // =========================

  const totalAmount = filteredExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  // =========================
  // CATEGORY ICON
  // =========================

  const getCategoryIcon = (category) => {
    if (category === "Food") return "F";
    if (category === "Transport") return "T";
    if (category === "Shopping") return "S";

    return "E";
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="transactions-page">
        <div className="transactions-loading">
          Loading transactions...
        </div>
      </main>
    );
  }

  return (
    <main className="transactions-page">

      {/* ================= HEADER ================= */}

      <div className="transactions-header">
        <div>
          <span className="transactions-badge">
            TRANSACTIONS
          </span>

          <h1>All Transactions</h1>

          <p>
            View, search and manage all your recorded expenses.
          </p>
        </div>

        <div className="transactions-summary">
          <span>TOTAL SPENDING</span>

          <strong>
            &#8377;{totalAmount.toFixed(0)}
          </strong>
        </div>
      </div>

      {/* ================= FILTER BAR ================= */}

      <section className="transactions-filter-panel">

        <div className="transactions-search">
          <span className="transactions-search-icon">
            Q
          </span>

          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="transactions-filters">

          <button
            className={
              categoryFilter === "All"
                ? "transaction-filter active"
                : "transaction-filter"
            }
            onClick={() => setCategoryFilter("All")}
          >
            All
          </button>

          <button
            className={
              categoryFilter === "Food"
                ? "transaction-filter active"
                : "transaction-filter"
            }
            onClick={() => setCategoryFilter("Food")}
          >
            Food
          </button>

          <button
            className={
              categoryFilter === "Transport"
                ? "transaction-filter active"
                : "transaction-filter"
            }
            onClick={() => setCategoryFilter("Transport")}
          >
            Transport
          </button>

          <button
            className={
              categoryFilter === "Shopping"
                ? "transaction-filter active"
                : "transaction-filter"
            }
            onClick={() => setCategoryFilter("Shopping")}
          >
            Shopping
          </button>

        </div>

      </section>

      {/* ================= TRANSACTION LIST ================= */}

      <section className="transactions-panel">

        <div className="transactions-panel-header">

          <div>
            <h2>Transaction History</h2>

            <p>
              {filteredExpenses.length} transaction
              {filteredExpenses.length !== 1 ? "s" : ""}
              {" "}found
            </p>
          </div>

          {searchTerm || categoryFilter !== "All" ? (
            <button
              className="transactions-clear-button"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("All");
              }}
            >
              Clear filters
            </button>
          ) : null}

        </div>

        {filteredExpenses.length > 0 ? (

          <div className="transactions-list">

            {filteredExpenses.map((expense) => (

              <div
                className="transaction-row"
                key={expense.id}
              >

                {/* ICON */}

                <div className="transaction-icon">
                  {getCategoryIcon(expense.category)}
                </div>

                {/* MAIN INFO */}

                <div className="transaction-main">

                  <strong>
                    {expense.description ||
                      expense.name ||
                      "Expense"}
                  </strong>

                  <span>
                    {expense.category || "Other"}
                  </span>

                </div>

                {/* DATE */}

                <div className="transaction-date">

                  <span>
                    DATE
                  </span>

                  <strong>
                    {new Date(
                      expense.date
                    ).toLocaleDateString("en-IN")}
                  </strong>

                </div>

                {/* AMOUNT */}

                <div className="transaction-amount">

                  <strong>
                    - &#8377;{Number(
                      expense.amount
                    ).toFixed(0)}
                  </strong>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="transactions-empty">

            <div className="transactions-empty-icon">
              -
            </div>

            <h3>
              No transactions found
            </h3>

            <p>
              Try changing your search or category filter.
            </p>

            {(searchTerm || categoryFilter !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("All");
                }}
              >
                Clear filters
              </button>
            )}

          </div>

        )}

      </section>

    </main>
  );
}