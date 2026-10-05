"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password
      })
    });

    const data = await response.json();

    if (data.success) {
      alert("Registration successful! Please login.");
      window.location.href = "/login";
    } else {
      alert(data.message);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Create Account ✨</h1>

        <p className="auth-subtitle">
          Create your account and start tracking your expenses.
        </p>

        <form className="auth-form" onSubmit={handleRegister}>
          <label>Name</label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Create Account
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <a href="/login">Login</a>
        </p>
      </div>
    </main>
  );
}