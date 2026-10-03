import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Invalid email or password");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/booking");

    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to backend.");
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-box">

        <div className="auth-logo">
          Eventify
        </div>

        <h2>Login</h2>

        <p className="auth-subtitle">
          Login to book your event tickets
        </p>

        <form onSubmit={loginUser}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="auth-button">
            Login
          </button>

        </form>

        {message && (
          <div className="auth-message">
            {message}
          </div>
        )}

        <p className="switch-auth">
          Don't have an account?

          <button
            type="button"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </p>

      </div>

    </div>
  );
}

export default Login;