"use client";

import { useState } from "react";

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
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    onDelete(id);
    setShowConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

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
            onClick={handleDeleteClick}
          >
            🗑️ Delete
          </button>

        </div>

      </div>

      {/* Delete Confirmation */}
      {showConfirmation && (
        <div className="delete-confirmation">

          <div className="delete-confirmation-content">

            <div className="delete-icon">
              ⚠️
            </div>

            <h3>
              Delete this expense?
            </h3>

            <p>
              Are you sure you want to delete{" "}
              <strong>{description}</strong>?
            </p>

            <div className="confirmation-actions">

              <button
                className="cancel-delete-btn"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>

              <button
                className="confirm-delete-btn"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}