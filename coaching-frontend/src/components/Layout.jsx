import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./Layout.css";
import UpgradeModal from "../components/UpgradeModal";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

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

      // reload user state
      window.location.reload();

    } catch (err) {
      console.error("Upgrade failed");
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

      <Sidebar />

      <div className="main">

        <div className="topbar">
          <Navbar />
        </div>

        <div className="content">
          {children}
        </div>

      </div>
    </div>
  );
}

export default Layout;