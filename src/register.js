import React, { useState } from "react";
import ReactPasswordChecklist from "react-password-checklist";
import { useNavigate } from "react-router-dom";

function Register() {
    const nav = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    function handlesubmit(e) {
        e.preventDefault();
        const username = e.target.username.value;
        const email = e.target.email.value;
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        })
            .then(res => res.json()).then(data => {
                if (data.success) {
                    alert("Registration successful");
                    nav("/login");
                }
                else {
                    alert("Registration failed");
                }
            })
    }

    return (
        <div className="auth-form-container">
            <h1>Register</h1>
            <form onSubmit={handlesubmit}>
                <label htmlFor="username">Enter your name</label>
                <input type="text" name="username" placeholder="Enter your username" required />
                <label htmlFor="email">Email</label>
                <input type="email" name="email" placeholder="Enter your email" required />
                <label htmlFor="password">Password</label>
                <input type="password" name="password" placeholder="Enter your password" required value={password} onChange={e=>setPassword(e.target.value)}/>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" name="confirmPassword" placeholder="Confirm your password" required value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/>
                <ReactPasswordChecklist
                    rules={["minLength", "specialChar", "number", "capital", "match"]}
                    minLength={8}
                    value={password}
                    valueAgain={confirmPassword}
                    onChange={(isValid) => console.log(isValid)} />
                <button type="submit">Register</button>
                <div className="auth-link" onClick={() => nav('/login')}>Already have an account? Login</div>
            </form>
        </div>
    );
}

export default Register;