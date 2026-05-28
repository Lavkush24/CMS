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
    <aside className="sidebar">
      
      <div className="sidebar-top">
        {/* LOGO */}
        <div className="logo">
          <h2>CMS</h2>
          {/* <span className="logo-text">Coaching Manager</span> */}
        </div>

        {/* NAV */}
        <nav className="nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <LayoutDashboard size={20} className="icon" />
            <span className="nav-text">Dashboard</span>
          </NavLink>

          <NavLink
            to="/students"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <Users size={20} className="icon" />
            <span className="nav-text">Students</span>
          </NavLink>

          <NavLink
            to="/teachers"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <GraduationCap size={20} className="icon" />
            <span className="nav-text">Teachers</span>
          </NavLink>

          <NavLink
            to="/batches"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <Layers size={20} className="icon" />
            <span className="nav-text">Batches</span>
          </NavLink>
        </nav>
      </div>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div className="nav-item">
          <Settings size={20} className="icon" />
          <span className="nav-text">Settings</span>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;