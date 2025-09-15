import React from "react";
// import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
function Login() {

    const nav = useNavigate();
    function handlesubmit(e) {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        fetch('http://localhost:5000/login',{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({username,password})
        }).then(res=>res.json())
        .then(res=>{
            if(res.success){
                
                alert("Login successful");
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("username", username);
                localStorage.setItem("email", res.email);
                nav("/");
            }else{
                alert("Login failed, please check your credentials");
                e.target.username.value = "";
                e.target.password.value = "";
            }
        })
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
                <div className="auth-link" onClick={()=>nav('/register')}>Don't have an account? Register</div>
            </form>
        </div>
    )
}
export default Login;