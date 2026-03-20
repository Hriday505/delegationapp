import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function DelegationManagementPage() {
  const { user } = useAuth();

  const [delegations, setDelegations] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    status: "pending",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchDelegations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/delegations");
      setDelegations(response.data.delegations || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch delegations");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (user?.role === "user") return;

    try {
      const response = await api.get("/users");
      const onlyUsers = (response.data.users || []).filter(
        (item) => item.role === "user" || item.role === "admin"
      );
      setUsers(onlyUsers);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDelegations();
      fetchUsers();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateDelegation = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/delegations", {
        ...formData,
        assigned_to: Number(formData.assigned_to),
      });

      setMessage("Delegation created successfully");
      setFormData({
        title: "",
        description: "",
        assigned_to: "",
        status: "pending",
      });
      fetchDelegations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create delegation");
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      setMessage("");
      setError("");
      await api.put(`/delegations/${id}/status`, { status });
      setMessage("Status updated successfully");
      fetchDelegations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this delegation?");
    if (!ok) return;

    try {
      await api.delete(`/delegations/${id}`);
      setMessage("Delegation deleted successfully");
      fetchDelegations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete delegation");
    }
  };

  return (
    <div>
      <h1>{user?.role === "user" ? "My Delegations" : "Delegation Management"}</h1>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {user?.role !== "user" && (
        <form style={styles.formCard} onSubmit={handleCreateDelegation}>
          <h3>Create Delegation</h3>

          <div style={styles.formGrid}>
            <input
              style={styles.input}
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
            />

            <input
              style={styles.input}
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
            />

            <select
              style={styles.input}
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
            >
              <option value="">Select User</option>
              {users.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.role})
                </option>
              ))}
            </select>

            <select
              style={styles.input}
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button style={styles.button} type="submit">
            Create Delegation
          </button>
        </form>
      )}

      <div style={styles.tableCard}>
        <h3>Delegation List</h3>

        {loading ? (
          <p>Loading delegations...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Assigned To</th>
                <th style={styles.th}>Created By</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {delegations.map((item) => (
                <tr key={item.id}>
                  <td style={styles.td}>{item.title}</td>
                  <td style={styles.td}>{item.description}</td>
                  <td style={styles.td}>{item.assigned_to_name}</td>
                  <td style={styles.td}>{item.created_by_name}</td>
                  <td style={styles.td}>
                    <span style={getStatusStyle(item.status)}>{item.status}</span>
                  </td>
                  <td style={styles.td}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <select
                      style={styles.smallInput}
                      value={item.status}
                      onChange={(e) =>
                        handleStatusUpdate(item.id, e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>

                    {user?.role === "superadmin" && (
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function getStatusStyle(status) {
  const common = {
    padding: "6px 10px",
    borderRadius: "999px",
    color: "#fff",
    fontSize: "12px",
    textTransform: "capitalize",
  };

  if (status === "pending") return { ...common, background: "#f59e0b" };
  if (status === "in-progress") return { ...common, background: "#3b82f6" };
  return { ...common, background: "#22c55e" };
}

const styles = {
  formCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
  },
  smallInput: {
    padding: "6px",
    marginRight: "8px",
  },
  button: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    background: "#dc2626",
    color: "#fff",
    cursor: "pointer",
  },
  tableCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #f3f4f6",
  },
};