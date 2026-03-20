import { Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar";

export default function DashboardLayout() {
  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "#f3f4f6",
  },
  main: {
    flex: 1,
    padding: "24px",
  },
};