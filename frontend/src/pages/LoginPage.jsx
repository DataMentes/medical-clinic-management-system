import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate(result.redirectTo);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <form className="form" onSubmit={handleLoginSubmit}>
      <h2>Welcome back</h2>
      <p className="form-subtitle">
        Login to your account to manage appointments.
      </p>
      
      {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
      
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
      
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}


