import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const nav = useNavigate();

  // Use environment variable for API URL
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  async function handlesubmit(e) {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        alert("Login successful");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        localStorage.setItem("email", data.email);
        nav("/");
      } else {
        alert("Login failed, please check your credentials");
        e.target.username.value = "";
        e.target.password.value = "";
      }
    } catch (error) {
      alert("Server error: Unable to login");
    }
  }

  return (
    <div className="auth-form-container">
      <h1>Login</h1>
      <form onSubmit={handlesubmit}>
        <label htmlFor="username">UserName</label>
        <input type="text" name="username" placeholder="Enter your username" required />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" placeholder="Enter your password" required />

        <button type="submit">Login</button>
        <div className="auth-link" onClick={() => nav('/register')}>
          Don't have an account? Register
        </div>
      </form>
    </div>
  );
}

export default Login;