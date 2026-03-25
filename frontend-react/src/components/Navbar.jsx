import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">🤖</span>
        <span className="navbar-title">FeedbackAI</span>
      </div>
      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Classify
        </NavLink>
        <NavLink to="/feedbacks" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Feedbacks
        </NavLink>
        <NavLink to="/batch" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Batch Upload
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Dashboard
        </NavLink>
      </div>
    </nav>
  );
}
