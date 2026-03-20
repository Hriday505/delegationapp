import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StatusDoughnutChart({ data = [] }) {
  const labels = data.map((item) => item.status);
  const values = data.map((item) => Number(item.total));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Delegations by Status",
        data: values,
        backgroundColor: ["#f59e0b", "#3b82f6", "#22c55e"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={styles.card}>
      <h3>Status Overview</h3>
      <Doughnut data={chartData} />
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
};