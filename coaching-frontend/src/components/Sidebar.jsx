import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  Settings
} from "lucide-react";

import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">

      {/* LOGO */}
      <div className="logo">
        <h2>CM</h2>
      </div>

      {/* NAV */}
      <nav className="nav">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/students"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Users size={18} />
          <span>Students</span>
        </NavLink>

        <NavLink
          to="/teachers"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <GraduationCap size={18} />
          <span>Teachers</span>
        </NavLink>

        <NavLink
          to="/batches"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Layers size={18} />
          <span>Batches</span>
        </NavLink>

      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div className="nav-item">
          <Settings size={18} />
          <span>Settings</span>
        </div>
      </div>

    </div>
  );
}

export default Sidebar;