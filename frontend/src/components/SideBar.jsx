import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside style={styles.sidebar}>
      <div>
        <h2 style={styles.logo}>DMS</h2>
        <p style={styles.roleText}>
          {user?.name} ({user?.role})
        </p>

        <nav style={styles.nav}>
          <Link style={isActive("/dashboard") ? styles.activeLink : styles.link} to="/dashboard">
            Dashboard
          </Link>

          {(user?.role === "superadmin" || user?.role === "admin") && (
            <Link
              style={isActive("/users") ? styles.activeLink : styles.link}
              to="/users"
            >
              User Management
            </Link>
          )}

          <Link
            style={isActive("/delegations") ? styles.activeLink : styles.link}
            to="/delegations"
          >
            {user?.role === "user" ? "My Delegations" : "Delegation Management"}
          </Link>

          <Link
            style={isActive("/reports") ? styles.activeLink : styles.link}
            to="/reports"
          >
            Reports
          </Link>
        </nav>
      </div>

      <button style={styles.logoutBtn} onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    minHeight: "100vh",
    background: "#111827",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "24px 16px",
    boxSizing: "border-box",
  },
  logo: {
    margin: "0 0 10px",
  },
  roleText: {
    fontSize: "14px",
    color: "#d1d5db",
    marginBottom: "24px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "transparent",
  },
  activeLink: {
    color: "#fff",
    textDecoration: "none",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "#2563eb",
  },
  logoutBtn: {
    padding: "10px 12px",
    border: "none",
    borderRadius: "8px",
    background: "#dc2626",
    color: "#fff",
    cursor: "pointer",
  },
};