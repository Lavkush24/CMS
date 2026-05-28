import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import UpgradeModal from "../components/UpgradeModal";
import { apiRequest } from "../api/client";
import "./Layout.css";

function Layout({ children }) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const handler = () => setShowUpgrade(true);

    window.addEventListener("show-upgrade", handler);
    return () => window.removeEventListener("show-upgrade", handler);
  }, []);

  const handleUpgrade = async () => {
    try {
      await apiRequest("/upgrade/plan", "POST");
      setShowUpgrade(false);
      window.location.reload();
    } catch (err) {
      console.error("Upgrade failed", err);
    }
  };

  return (
    <div className="layout">
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* The sticky sidebar we just built */}
      <Sidebar />

      {/* Main content dynamically reacts to sidebar width */}
      <main className="main">
        <header className="topbar">
          <Navbar />
        </header>

        <section className="content">
          {children}
        </section>
      </main>
    </div>
  );
}

export default Layout;