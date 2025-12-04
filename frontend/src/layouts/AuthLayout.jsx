import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="app auth-layout">
      <div className="auth-hero">
        <div className="auth-gradient" />
        <div className="auth-hero-content">
          <h1>CarePoint Clinic</h1>
          <p>Book, manage, and track your medical appointments in seconds.</p>
          <ul>
            <li>Online booking & cancellations</li>
            <li>Smart conflict prevention</li>
            <li>Secure patient records</li>
          </ul>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-panel-inner card fade-in-up">
          <div className="auth-switch">
            <Link to="/login">Login</Link>
            <span>·</span>
            <Link to="/register">Create account</Link>
          </div>
          <Outlet />
        </div>
        <p className="auth-footer">For demo use only · Frontend prototype</p>
      </div>
    </div>
  );
}


