import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Dashboard from "../components/Dashboard";

export default function Home() {
  return (
    <div className="app-layout">

      <Sidebar />

      <div className="main-content">

        <Navbar />

        <Dashboard />

      </div>

    </div>
  );
}