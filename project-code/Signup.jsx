import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const signupUser = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/signup`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name: name,
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Signup failed.");
        return;
      }

      setMessage("Signup successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/");
      }, 1000);

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

        <h2>Create Account</h2>

        <p className="auth-subtitle">
          Sign up to book event tickets
        </p>

        <form onSubmit={signupUser}>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            Sign Up
          </button>

        </form>

        {message && (
          <div className="auth-message">
            {message}
          </div>
        )}

        <p className="switch-auth">
          Already have an account?

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Login
          </button>
        </p>

      </div>

    </div>
  );
}

export default Signup;