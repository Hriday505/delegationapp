import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import StatusDoughnutChart from "../charts/StatusChartCircle";
import MonthlyBarChart from "../charts/MonthlyChart";
import UserDelegationBarChart from "../charts/DelegationChart";

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const endpoint =
        user?.role === "user" ? "/reports/my-report" : "/reports/dashboard";

      const response = await api.get(endpoint);

      setSummary(response.data.summary);
      setCharts(response.data.charts || {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}</p>

      <div style={styles.grid}>
        <Card title="Total Delegations" value={summary?.total_delegations || 0} />
        <Card title="Pending" value={summary?.pending || 0} />
        <Card title="In Progress" value={summary?.in_progress || 0} />
        <Card title="Completed" value={summary?.completed || 0} />
        {user?.role !== "user" && (
          <Card title="Total Users" value={summary?.total_users || 0} />
        )}
      </div>

      <div style={styles.chartGrid}>
        <StatusDoughnutChart data={charts.by_status || []} />
        <MonthlyBarChart data={charts.monthly_delegations || []} />
        {user?.role !== "user" && (
          <UserDelegationBarChart data={charts.by_user || []} />
        )}
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>
      <p style={styles.value}>{value}</p>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginTop: "20px",
    marginBottom: "24px",
  },
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
  value: {
    fontSize: "28px",
    fontWeight: "bold",
    margin: "8px 0 0",
  },
};