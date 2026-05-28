import { useState } from "react";
import { logout } from "../auth/auth";
import { User, LogOut, Settings } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import "./Navbar.css";
import { useEffect, useRef } from "react";

function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="navbar">

      {/* LEFT */}
      <div className="nav-left">
        <h3></h3>
      </div>

      {/* RIGHT */}
      <div className="nav-right">

        <ThemeToggle />

        {/* USER */}
        <div className="user-menu" ref={menuRef}>
          <div
            className="avatar"
            onClick={() => setOpen(!open)}
          >
            <User size={18} />
          </div>

          {open && (
            <div className="dropdown">

              <div className="dropdown-item">
                <User size={16} />
                Profile
              </div>

              <div className="dropdown-item">
                <Settings size={16} />
                Settings
              </div>

              <div
                className="dropdown-item logout"
                onClick={logout}
              >
                <LogOut size={16} />
                Logout
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Navbar;