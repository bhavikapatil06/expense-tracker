
"use client";

import { useEffect, useState } from "react";

const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Groceries",
  "Transportation",
  "Electricity Bill",
  "Water Bill",
  "Mobile Recharge",
  "Internet & Wi-Fi",
  "Rent",
  "Education & Fees",
  "Books & Stationery",
  "Medical & Healthcare",
  "Personal Care",
  "Shopping",
  "EMI & Loan Payments",
  "Insurance",
  "Entertainment",
  "Travel",
  "Family & Household",
  "Gifts & Donations",
  "Subscriptions",
  "Savings & Investments",
  "Miscellaneous",
];

const PIE_COLORS = [
  "#69c58a",
  "#69a9f7",
  "#e6b85c",
  "#b99af7",
  "#e78e91",
  "#55c5c0",
  "#e9a36a",
  "#9ca3af",
];

const formatMoney = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const normalizeCategory = (category = "") => {
  const value = String(category).trim().toLowerCase();

  const legacyCategories = {
    food: "Food & Dining",
    transport: "Transportation",
    bills: "Miscellaneous",
  };

  const officialCategory = EXPENSE_CATEGORIES.find(
    (item) => item.toLowerCase() === value
  );

  return (
    officialCategory ||
    legacyCategories[value] ||
    String(category).trim() ||
    "Miscellaneous"
  );
};

const getCategoryIcon = (category = "") => {
  const value = normalizeCategory(category);

  if (value === "Food & Dining" || value === "Groceries") {
    return "▤";
  }

  if (value === "Transportation" || value === "Travel") {
    return "➜";
  }

  if (
    value === "Electricity Bill" ||
    value === "Water Bill" ||
    value === "Mobile Recharge" ||
    value === "Internet & Wi-Fi"
  ) {
    return "ϟ";
  }

  if (
    value === "Education & Fees" ||
    value === "Books & Stationery"
  ) {
    return "◇";
  }

  if (
    value === "Medical & Healthcare" ||
    value === "Personal Care"
  ) {
    return "+";
  }

  if (
    value === "Rent" ||
    value === "Family & Household"
  ) {
    return "⌂";
  }

  if (value === "Shopping") return "□";
  if (value === "Entertainment") return "♪";
  if (value === "EMI & Loan Payments") return "₹";
  if (value === "Savings & Investments") return "↗";
  if (value === "Gifts & Donations") return "♡";

  return "○";
};

export default function AnalyticsPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchExpenses = async () => {
      try {
        setLoadError("");

        const response = await fetch("/api/expenses", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load expenses.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.expenses)) {
          throw new Error(data.message || "Invalid expense data.");
        }

        setExpenses(data.expenses);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to load analytics:", error);
          setLoadError("Analytics couldn't be loaded. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchExpenses();

    return () => controller.abort();
  }, []);

  const validExpenses = expenses.filter(
    (expense) =>
      Number.isFinite(Number(expense.amount)) &&
      Number(expense.amount) >= 0
  );

  const totalExpenses = validExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthlyExpenses = validExpenses.filter((expense) => {
    const date = new Date(expense.date);

    return (
      !Number.isNaN(date.getTime()) &&
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  });

  const monthlyTotal = monthlyExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const categoryTotals = validExpenses.reduce((totals, expense) => {
    const category = normalizeCategory(expense.category);

    totals[category] =
      (totals[category] || 0) + Number(expense.amount);

    return totals;
  }, {});

  const sortedCategories = Object.entries({
    ...Object.fromEntries(
      EXPENSE_CATEGORIES.map((category) => [category, 0])
    ),
    ...categoryTotals,
  }).sort((a, b) => b[1] - a[1]);

  const pieCategories = sortedCategories.map(
    ([category, amount], index) => ({
      category,
      amount,
      percentage:
        totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      color: PIE_COLORS[index % PIE_COLORS.length],
    })
  );

  const pieGradient =
    totalExpenses > 0
      ? (() => {
          let currentPercentage = 0;

          const slices = pieCategories
            .filter((item) => item.amount > 0)
            .map((item) => {
              const start = currentPercentage;
              currentPercentage += item.percentage;

              return `${item.color} ${start}% ${currentPercentage}%`;
            });

          return `conic-gradient(${slices.join(", ")})`;
        })()
      : "conic-gradient(#343b46 0% 100%)";

  const highestCategory =
    sortedCategories.find(([, amount]) => amount > 0) || null;

  const monthlyTotals = {};

  validExpenses.forEach((expense) => {
    const date = new Date(expense.date);

    if (Number.isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!monthlyTotals[key]) {
      monthlyTotals[key] = {
        label: date.toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        }),
        amount: 0,
      };
    }

    monthlyTotals[key].amount += Number(expense.amount);
  });

  const monthlyData = Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, value]) => ({
      key,
      month: value.label,
      amount: value.amount,
    }));

  const maxMonthlyAmount = Math.max(
    0,
    ...monthlyData.map((item) => item.amount)
  );

  if (loading) {
    return (
      <main className="analytics-page">
        <div className="analytics-loading">Loading analytics...</div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="analytics-page">
        <div className="analytics-empty" role="alert">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="analytics-page">
      <div className="analytics-header">
        <div>
          <span className="analytics-badge">ANALYTICS</span>
          <h1>Spending Analytics</h1>
          <p>
            Understand where your money goes and discover your spending
            patterns.
          </p>
        </div>

        <div className="analytics-period">
          <span>ANALYSIS PERIOD</span>
          <strong>
            {currentDate.toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </strong>
        </div>
      </div>

      {/* FOUR SUMMARY CARDS */}
      <div className="analytics-summary">
        <div className="analytics-card">
          <div className="analytics-card-icon">&#8377;</div>
          <span>Total Spending</span>
          <h2>{formatMoney(totalExpenses)}</h2>
          <small>All recorded expenses</small>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon">&#8599;</div>
          <span>This Month</span>
          <h2>{formatMoney(monthlyTotal)}</h2>
          <small>Current month spending</small>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon">#</div>
          <span>Transactions</span>
          <h2>{expenses.length}</h2>
          <small>Total recorded transactions</small>
        </div>

        <div className="analytics-card analytics-top-category-card">
          <div className="analytics-card-icon">&#9733;</div>
          <span>Top Spending Category</span>
          <h2 className="analytics-top-category-name">
            {highestCategory ? highestCategory[0] : "—"}
          </h2>
          <small>
            {highestCategory
              ? `${formatMoney(highestCategory[1])} spent · ${
                  totalExpenses > 0
                    ? (
                        (highestCategory[1] / totalExpenses) *
                        100
                      ).toFixed(1)
                    : "0.0"
                }% of total`
              : "No expenses recorded"}
          </small>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN */}
      <div className="analytics-grid">
        <section className="analytics-panel analytics-category-panel">
          <div className="analytics-panel-heading">
            <div>
              <h2>Expense Analytics</h2>
              <p>Category-wise spending breakdown</p>
            </div>
          </div>

          {totalExpenses > 0 ? (
            <div className="analytics-breakdown-layout">
              <div className="analytics-pie-chart-area">
                <div
                  className="analytics-pie-chart"
                  style={{ background: pieGradient }}
                  role="img"
                  aria-label={`Category-wise spending breakdown. Total expenses ${formatMoney(
                    totalExpenses
                  )}`}
                >
                  <div className="analytics-pie-center">
                    <span>Total expenses</span>
                    <strong>{formatMoney(totalExpenses)}</strong>
                  </div>
                </div>

                <small className="analytics-chart-caption">
                  Category-wise share of total expenses
                </small>
              </div>

              <div className="analytics-category-list">
                {pieCategories.map((item) => (
                  <div
                    className="analytics-category"
                    key={item.category}
                  >
                    <div className="analytics-category-top">
                      <div className="analytics-category-label">
                        <span
                          className="analytics-category-dot"
                          style={{ background: item.color }}
                        />
                        <span>{item.category}</span>
                      </div>

                      <strong>{formatMoney(item.amount)}</strong>
                    </div>

                    <div className="analytics-progress">
                      <div
                        className="analytics-progress-fill"
                        style={{
                          width: `${item.percentage}%`,
                          background: item.color,
                        }}
                      />
                    </div>

                    <small>
                      {item.percentage.toFixed(1)}% of total
                    </small>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="analytics-empty">
              No expense data available yet.
            </div>
          )}
        </section>
      </div>

      {/* MONTHLY TREND */}
      <section className="analytics-panel analytics-monthly-panel">
        <div className="analytics-panel-heading">
          <div>
            <h2>Monthly Spending</h2>
            <p>Your spending across recent months.</p>
          </div>
        </div>

        {monthlyData.length > 0 ? (
          <div className="monthly-chart">
            {monthlyData.map((item) => {
              const height =
                maxMonthlyAmount > 0
                  ? (item.amount / maxMonthlyAmount) * 100
                  : 0;

              return (
                <div
                  className="monthly-bar-wrapper"
                  key={item.key}
                >
                  <div className="monthly-value">
                    {formatMoney(item.amount)}
                  </div>

                  <div className="monthly-bar-container">
                    <div
                      className="monthly-bar"
                      style={{ height: `${height}%` }}
                    />
                  </div>

                  <span>{item.month}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="analytics-empty">
            No monthly spending data available.
          </div>
        )}
      </section>

      {/* RECENT TRANSACTIONS */}
      <section className="analytics-panel">
        <div className="analytics-panel-heading">
          <div>
            <h2>Recent Transactions</h2>
            <p>Your latest spending activity.</p>
          </div>
        </div>

        {expenses.length > 0 ? (
          <div className="analytics-transactions">
            {expenses
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() -
                  new Date(a.date).getTime()
              )
              .slice(0, 5)
              .map((expense, index) => (
                <div
                  className="analytics-transaction"
                  key={
                    expense.id ??
                    expense._id ??
                    `${expense.date}-${index}`
                  }
                >
                  <div className="analytics-transaction-icon">
                    {getCategoryIcon(expense.category)}
                  </div>

                  <div className="analytics-transaction-info">
                    <strong>
                      {expense.description || expense.name || "Expense"}
                    </strong>
                    <span>{normalizeCategory(expense.category)}</span>
                  </div>

                  <div className="analytics-transaction-right">
                    <strong>{formatMoney(expense.amount)}</strong>
                    <span>
                      {expense.date &&
                      !Number.isNaN(new Date(expense.date).getTime())
                        ? new Date(expense.date).toLocaleDateString(
                            "en-IN"
                          )
                        : "—"}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="analytics-empty">No transactions yet.</div>
        )}
      </section>
    </main>
  );
}