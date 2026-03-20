import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1>404</h1>
        <p>Page not found</p>
        <Link to="/login">Go to Login</Link>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f3f4f6",
  },
  card: {
    textAlign: "center",
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
  },
};