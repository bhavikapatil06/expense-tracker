"use client";

import { useEffect, useMemo, useState } from "react";

const formatMoney = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getDescription = (expense) =>
  expense.description || expense.name || "Expense";

const getCategoryIcon = (category = "") => {
  const value = category.toLowerCase();

  if (/food|grocer/.test(value)) return "▤";
  if (/transport|travel|fuel/.test(value)) return "➜";
  if (/bill|electricity|recharge/.test(value)) return "ϟ";
  if (/education|fee|course/.test(value)) return "◇";
  if (/shopping/.test(value)) return "□";
  if (/health|medical|medicine/.test(value)) return "+";
  if (/rent|home|house/.test(value)) return "⌂";
  if (/emi|loan/.test(value)) return "₹";

  return "○";
};

export default function TransactionsPage() {
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchExpenses() {
      try {
        setLoadError("");

        const response = await fetch("/api/expenses", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load transactions.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.expenses)) {
          throw new Error(
            data.message || "Unexpected transaction data."
          );
        }

        setExpenses(data.expenses);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to load transactions:", error);
          setLoadError(
            "Transactions couldn't be loaded. Please try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchExpenses();

    return () => controller.abort();
  }, []);

  // Build the dropdown from categories actually in the saved data.
  const categories = useMemo(() => {
    return [
      ...new Set(
        expenses
          .map((expense) => expense.category?.trim())
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [expenses]);

  // Search and category filtering.
  const filteredExpenses = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const result = expenses.filter((expense) => {
      const matchesSearch = [
        getDescription(expense),
        expense.name,
        expense.category,
        expense.notes,
      ].some((value) =>
        String(value || "").toLowerCase().includes(search)
      );

      const matchesCategory =
        categoryFilter === "All" ||
        expense.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      const amountA = Number(a.amount) || 0;
      const amountB = Number(b.amount) || 0;
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;

      switch (sortBy) {
        case "oldest":
          return dateA - dateB;
        case "highest":
          return amountB - amountA;
        case "lowest":
          return amountA - amountB;
        case "newest":
        default:
          return dateB - dateA;
      }
    });

    return result;
  }, [expenses, searchTerm, categoryFilter, sortBy]);

  // Summary cards always reflect all loaded transactions.
  const totalSpent = useMemo(
    () =>
      expenses.reduce(
        (total, expense) => total + (Number(expense.amount) || 0),
        0
      ),
    [expenses]
  );

  // Download the currently filtered and sorted transactions.
  const exportCSV = () => {
    if (filteredExpenses.length === 0) return;

    const columns = ["Description", "Category", "Date", "Amount"];

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = filteredExpenses.map((expense) => [
      getDescription(expense),
      expense.category || "Other",
      formatDate(expense.date),
      Number(expense.amount) || 0,
    ]);

    const csv = [columns, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "transactions.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setSortBy("newest");
  };

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
    <main className="transactions-page transactions-page-polished">
      <header className="transactions-header">
        <div>
          <span className="transactions-badge">
            TRANSACTIONS
          </span>

          <h1>Transactions</h1>

          <p>
            Search, filter and manage your spending activity.
          </p>
        </div>

        <button
          type="button"
          className="transactions-export-button"
          onClick={exportCSV}
          disabled={filteredExpenses.length === 0}
        >
          <span aria-hidden="true">↓</span>
          Export CSV
        </button>
      </header>

      {loadError ? (
        <section className="transactions-error" role="alert">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </section>
      ) : (
        <>
          <section
            className="transactions-summary-grid"
            aria-label="Transaction summary"
          >
            <article className="transactions-stat-card">
              <span>Total transactions</span>
              <strong>{expenses.length}</strong>
            </article>

            <article className="transactions-stat-card">
              <span>Total spent</span>
              <strong>{formatMoney(totalSpent)}</strong>
            </article>
          </section>

          <section
            className="transactions-toolbar"
            aria-label="Search and filter transactions"
          >
            <label className="transactions-search transactions-search-polished">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Search transactions"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </label>

            <div className="transactions-selects">
              <label className="transactions-select-wrap">
                <span className="transactions-sr-only">
                  Filter by category
                </span>
                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(event.target.value)
                  }
                >
                  <option value="All">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="transactions-select-wrap">
                <span className="transactions-sr-only">
                  Sort transactions
                </span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="highest">Highest amount</option>
                  <option value="lowest">Lowest amount</option>
                </select>
              </label>
            </div>
          </section>

          <section className="transactions-panel transactions-panel-polished">
            <div className="transactions-panel-header">
              <div>
                <h2>Transaction history</h2>
                <p>
                  {filteredExpenses.length}{" "}
                  {filteredExpenses.length === 1
                    ? "transaction"
                    : "transactions"}{" "}
                  found
                </p>
              </div>

              {(searchTerm || categoryFilter !== "All" || sortBy !== "newest") && (
                <button
                  type="button"
                  className="transactions-clear-button"
                  onClick={clearFilters}
                >
                  Reset filters
                </button>
              )}
            </div>

            {filteredExpenses.length > 0 ? (
              <div className="transactions-list">
                {filteredExpenses.map((expense, index) => (
                  <article
                    className="transaction-row transaction-row-polished"
                    key={expense.id ?? expense._id ?? `${expense.date}-${index}`}
                  >
                    <div
                      className="transaction-icon transaction-icon-polished"
                      aria-hidden="true"
                    >
                      {getCategoryIcon(expense.category)}
                    </div>

                    <div className="transaction-main">
                      <strong>{getDescription(expense)}</strong>
                      <span>
                        {expense.category || "Other"} ·{" "}
                        {formatDate(expense.date)}
                      </span>
                    </div>

                    <div className="transaction-amount transaction-amount-polished">
                      <strong>
                        −{formatMoney(expense.amount)}
                      </strong>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="transactions-empty">
                <div className="transactions-empty-icon" aria-hidden="true">
                  ⌕
                </div>

                <h3>
                  {expenses.length === 0
                    ? "No transactions yet"
                    : "No transactions found"}
                </h3>

                <p>
                  {expenses.length === 0
                    ? "Add an expense to see it here."
                    : "Try another search term or category."}
                </p>

                {expenses.length > 0 && (
                  <button type="button" onClick={clearFilters}>
                    Reset filters
                  </button>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}