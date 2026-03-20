import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import StatusDoughnutChart from "../charts/StatusChartCircle";
import MonthlyBarChart from "../charts/MonthlyChart";
import UserDelegationBarChart from "../charts/DelegationChart";

export default function ReportsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const endpoint =
        user?.role === "user" ? "/reports/my-report" : "/reports/dashboard";

      const response = await api.get(endpoint);

      setSummary(response.data.summary);
      setCharts(response.data.charts || {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchReports();
  }, [user]);

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>Reports</h1>

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>Total: {summary?.total_delegations || 0}</div>
        <div style={styles.summaryCard}>Pending: {summary?.pending || 0}</div>
        <div style={styles.summaryCard}>In Progress: {summary?.in_progress || 0}</div>
        <div style={styles.summaryCard}>Completed: {summary?.completed || 0}</div>
        {user?.role !== "user" && (
          <div style={styles.summaryCard}>Users: {summary?.total_users || 0}</div>
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

const styles = {
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  summaryCard: {
    background: "#fff",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    fontWeight: "bold",
  },
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
};