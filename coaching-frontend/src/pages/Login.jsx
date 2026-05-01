import { useEffect } from "react";
import { setToken, getToken } from "../auth/auth";
import { useNavigate, useLocation } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 🔹 already logged in
    const existingToken = getToken();
    if (existingToken) {
      navigate("/dashboard");
      return;
    }

    // 🔹 extract token from URL
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      setToken(token);

      // 🔥 remove token from URL
      window.history.replaceState({}, document.title, "/login");

      navigate("/dashboard");
    }
  }, [location, navigate]);

  return (
    <div style={styles.container}>
      <h1>Coaching Manager</h1>

      <button
        onClick={() => {
          window.location.href = `${import.meta.env.VITE_API_URL}/auth/login`;
        }}
      >
        Login with Google
      </button>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  }
};

export default Login;