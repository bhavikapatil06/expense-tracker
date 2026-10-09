"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const getCategoryIcon = (category) => {
  const value = category?.toLowerCase();

  if (value === "food") {
    return "◆";
  }

  if (value === "transport") {
    return "➜";
  }

  if (value === "shopping") {
    return "□";
  }

  if (value === "entertainment") {
    return "♪";
  }

  return "○";
};

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch("/api/expenses");
        const data = await response.json();

        if (data.success) {
          setExpenses(data.expenses);
        }
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

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

  const monthlyTotal = monthlyExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const averageExpense =
    expenses.length > 0
      ? totalExpenses / expenses.length
      : 0;

  const categoryTotals = expenses.reduce((totals, expense) => {
    if (!totals[expense.category]) {
      totals[expense.category] = 0;
    }

    totals[expense.category] += Number(expense.amount);

    return totals;
  }, {});

  const sortedCategories = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  );
  const pieColors = [
  "#69c58a",
  "#69a9f7",
  "#e6b85c",
  "#b99af7",
  "#e78e91",
  "#55c5c0",
  "#e9a36a",
  "#9ca3af",
];

const pieCategories = sortedCategories.map(
  ([category, amount], index) => ({
    category,
    amount,
    percentage:
      totalExpenses > 0
        ? (amount / totalExpenses) * 100
        : 0,
    color: pieColors[index % pieColors.length],
  })
);

const pieGradient =
  pieCategories.length > 0 && totalExpenses > 0
    ? (() => {
        let currentPercentage = 0;

        return `conic-gradient(${pieCategories
          .map((item) => {
            const start = currentPercentage;
            currentPercentage += item.percentage;

            return `${item.color} ${start}% ${currentPercentage}%`;
          })
          .join(", ")})`;
      })()
    : "conic-gradient(#343b46 0% 100%)";

  const highestCategory =
    sortedCategories.length > 0
      ? sortedCategories[0]
      : null;

  const monthlyTotals = {};

  expenses.forEach((expense) => {
    const date = new Date(expense.date);

    const monthName = date.toLocaleString("en-US", {
      month: "short",
    });

    const year = date.getFullYear();
    const key = `${monthName} ${year}`;

    if (!monthlyTotals[key]) {
      monthlyTotals[key] = 0;
    }

    monthlyTotals[key] += Number(expense.amount);
  });

  const monthlyData = Object.entries(monthlyTotals)
    .sort((a, b) => {
      const dateA = new Date(a[0]);
      const dateB = new Date(b[0]);

      return dateA - dateB;
    })
    .slice(-6);

  if (loading) {
    return (
      <main className="analytics-page">
        <div className="analytics-loading">
          Loading analytics...
        </div>
      </main>
    );
  }

  return (
    <main className="analytics-page">

      {/* HEADER */}

      <div className="analytics-header">

        <div>
          <span className="analytics-badge">
            ANALYTICS
          </span>

          <h1>Spending Analytics</h1>

          <p>
            Understand where your money goes and
            discover your spending patterns.
          </p>
        </div>

        <div className="analytics-period">

          <span>
            ANALYSIS PERIOD
          </span>

          <strong>
            {currentDate.toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </strong>

        </div>

      </div>

      {/* SUMMARY */}

      <div className="analytics-summary">

        {/* TOTAL SPENDING */}

        <div className="analytics-card">

          <div className="analytics-card-icon">
            &#8377;
          </div>

          <span>
            Total Spending
          </span>

          <h2>
            &#8377;{totalExpenses.toFixed(0)}
          </h2>

          <small>
            All recorded expenses
          </small>

        </div>

        {/* THIS MONTH */}

        <div className="analytics-card">

          <div className="analytics-card-icon">
            &#8599;
          </div>

          <span>
            This Month
          </span>

          <h2>
            &#8377;{monthlyTotal.toFixed(0)}
          </h2>

          <small>
            Current month spending
          </small>

        </div>

        {/* TRANSACTIONS */}

        <div className="analytics-card">

          <div className="analytics-card-icon">
            #
          </div>

          <span>
            Transactions
          </span>

          <h2>
            {expenses.length}
          </h2>

          <small>
            Total recorded transactions
          </small>

        </div>

        {/* AVERAGE EXPENSE */}

        <div className="analytics-card">

          <div className="analytics-card-icon">
            &#8776;
          </div>

          <span>
            Average Expense
          </span>

          <h2>
            &#8377;{averageExpense.toFixed(0)}
          </h2>

          <small>
            Average per transaction
          </small>

        </div>

      </div>

      {/* MAIN GRID */}

      <div className="analytics-grid">

        
{/* CATEGORY BREAKDOWN */}

<section className="analytics-panel analytics-category-panel">
  <div className="analytics-panel-heading">
    <div>
      <h2>Expense Analytics</h2>
      <p>Category-wise spending breakdown</p>
    </div>
  </div>

  {pieCategories.length > 0 ? (
    <>
      <div className="analytics-pie-chart-area">
        <div
          className="analytics-pie-chart"
          style={{ background: pieGradient }}
          role="img"
          aria-label={`Category-wise spending breakdown. Total expenses ₹${totalExpenses.toFixed(0)}`}
        >
          <div className="analytics-pie-center">
            <span>Total expenses</span>
            <strong>₹{totalExpenses.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}</strong>
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

              <strong>
                ₹{item.amount.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </strong>
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

            <small>{item.percentage.toFixed(1)}% of total</small>
          </div>
        ))}
      </div>
    </>
  ) : (
    <div className="analytics-empty">
      No expense data available yet.
    </div>
  )}
</section>
        {/* TOP CATEGORY */}

        <section className="analytics-panel analytics-insight-panel">

          <div className="analytics-panel-heading">

            <div>

              <h2>
                Top Spending Category
              </h2>

              <p>
                Your biggest spending area.
              </p>

            </div>

          </div>

          {highestCategory ? (

            <div className="top-category">

              <div className="top-category-icon">
                &#9733;
              </div>

              <span>
                Highest spending
              </span>

              <h3>
                {highestCategory[0]}
              </h3>

              <strong>
                &#8377;{highestCategory[1].toFixed(0)}
              </strong>

              <small>
                {totalExpenses > 0
                  ? (
                      (highestCategory[1] /
                        totalExpenses) *
                      100
                    ).toFixed(1)
                  : 0}
                % of your total spending
              </small>

            </div>

          ) : (

            <div className="analytics-empty">
              Add expenses to see your insights.
            </div>

          )}

        </section>

      </div>

      {/* MONTHLY TREND */}

      <section className="analytics-panel analytics-monthly-panel">

        <div className="analytics-panel-heading">

          <div>

            <h2>
              Monthly Spending
            </h2>

            <p>
              Your spending across recent months.
            </p>

          </div>

        </div>

        {monthlyData.length > 0 ? (

          <div className="monthly-chart">

            {monthlyData.map(
              ([month, amount]) => {

                const maxMonthlyAmount =
                  Math.max(
                    ...monthlyData.map(
                      ([, value]) => value
                    )
                  );

                const height =
                  maxMonthlyAmount > 0
                    ? (amount /
                        maxMonthlyAmount) *
                      100
                    : 0;

                return (
                  <div
                    className="monthly-bar-wrapper"
                    key={month}
                  >

                    <div className="monthly-value">
                      &#8377;{amount.toFixed(0)}
                    </div>

                    <div className="monthly-bar-container">

                      <div
                        className="monthly-bar"
                        style={{
                          height: `${height}%`,
                        }}
                      />

                    </div>

                    <span>
                      {month}
                    </span>

                  </div>
                );
              }
            )}

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

            <h2>
              Recent Transactions
            </h2>

            <p>
              Your latest spending activity.
            </p>

          </div>

        </div>

        {expenses.length > 0 ? (

          <div className="analytics-transactions">

            {expenses
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.date) -
                  new Date(a.date)
              )
              .slice(0, 5)
              .map((expense) => (

                <div
                  className="analytics-transaction"
                  key={expense.id}
                >

                  <div className="analytics-transaction-icon">
                    {getCategoryIcon(expense.category)}
                  </div>

                  <div className="analytics-transaction-info">

                    <strong>
                      {expense.description}
                    </strong>

                    <span>
                      {expense.category}
                    </span>

                  </div>

                  <div className="analytics-transaction-right">

                    <strong>
                      &#8377;{Number(expense.amount).toFixed(0)}
                    </strong>

                    <span>
                      {new Date(
                        expense.date
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </span>

                  </div>

                </div>

              ))}

          </div>

        ) : (

          <div className="analytics-empty">
            No transactions yet.
          </div>

        )}

      </section>

    </main>
  );
}