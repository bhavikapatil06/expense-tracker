import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";

export default function Home() {
  return (
    <main className="app-layout">
      <Sidebar />

      <div className="main-content">
        <Dashboard />
      </div>
    </main>
  );
}