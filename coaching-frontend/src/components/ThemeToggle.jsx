import { useState, useEffect } from "react";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark");
      setDark(true);
    }
  }, []);

  function toggle() {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    setDark(isDark);
  }

  return (
    <button onClick={toggle}>
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

export default ThemeToggle;