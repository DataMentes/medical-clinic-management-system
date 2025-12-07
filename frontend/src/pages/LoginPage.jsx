import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth.api.js";



export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login(email, password);

      if (response.success && response.data) {
        const redirectPath = response.data.redirectTo || "/patient/dashboard";
        navigate(redirectPath);
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    }
  };

  return (
    <form className="form" onSubmit={handleLoginSubmit}>
      <h2>Welcome back</h2>
      <p className="form-subtitle">
        Enter your credentials to access your account.
      </p>

      {error && (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-md)",
            color: "#dc2626",
            marginBottom: "1rem",
            fontSize: "0.9rem"
          }}
        >
          {error}
        </div>
      )}

      <label className="field">
        <span>Email</span>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      <button type="submit" className="btn-primary">
        Continue
      </button>
    </form>
  );
}
