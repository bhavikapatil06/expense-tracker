"use client";

import { useState, useEffect } from "react";

export default function ExpenseForm({ onAddExpense, editingExpense }) {

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(() => {
  return new Date().toISOString().split("T")[0];
});
  useEffect(() => {
  if (editingExpense) {
    setName(editingExpense.description);
    setAmount(editingExpense.amount);
    setCategory(editingExpense.category);
    setDate(editingExpense.date || "");
  }
}, [editingExpense]);
const handleSubmit = (e) => {
  e.preventDefault();
  if (name.trim() === "") {
  alert("Please enter an expense name.");
  return;
}
if (amount === "" || Number(amount) <= 0) {
  alert("Please enter a valid amount greater than 0.");
  return;
}
if (date === "") {
  alert("Please select a date.");
  return;
}

  const expenseData = {
    id: editingExpense ? editingExpense.id : Date.now(),
    description: name,
    amount: Number(amount),
    category: category,
    date: date
  };

  onAddExpense(expenseData);

setName("");
setAmount("");
setCategory("Food");
setDate(new Date().toISOString().split("T")[0]);
};

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2>{editingExpense ? "Edit Expense" : "Add New Expense"}</h2>

      <div className="form-group">
        <label>Expense Name</label>
        <input
          type="text"
          placeholder="e.g. Coffee"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Amount</label>
        <input
          type="number"
          placeholder="e.g. 150"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Food</option>
          <option>Transport</option>
          <option>Shopping</option>
          <option>Entertainment</option>
          <option>Bills</option>
        </select>
      </div>

      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <button type="submit">
  {editingExpense ? "Update Expense" : "Add Expense"}
</button>
    </form>
  );
}