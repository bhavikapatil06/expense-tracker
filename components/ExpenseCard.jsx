const categoryIcons = {
  Food: "🍔",
  Transport: "🚌",
  Shopping: "🛍️",
  Entertainment: "🎬",
  Bills: "💡"
};

export default function ExpenseCard({
  id,
  category,
  description,
  amount,
  date,
  onDelete,
  onEdit
}) {
  return (
    <div className="expense-card">

      <div className="expense-info">

        <div className="expense-category">
          {categoryIcons[category] || "💰"}
        </div>

        <div>
          <h3>{description}</h3>

          <p className="expense-date">
            📅 {date}
          </p>

          <p className="expense-category-name">
            {category}
          </p>
        </div>

      </div>

      <div className="expense-right">

        <h3 className="expense-amount">
          ₹{amount}
        </h3>

        <div className="expense-actions">

          <button
            className="edit-btn"
            onClick={() => onEdit(id)}
          >
            ✏️ Edit
          </button>

          <button
            className="delete-btn"
            onClick={() => onDelete(id)}
          >
            🗑️ Delete
          </button>

        </div>

      </div>

    </div>
  );
}