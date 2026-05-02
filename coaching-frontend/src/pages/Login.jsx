import { useEffect } from "react";
import { setToken, getToken } from "../auth/auth";
import { useNavigate, useLocation } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    //  FIRST: handle OAuth token
    if (token) {
      setToken(token);

      window.history.replaceState({}, document.title, "/login");
      navigate("/dashboard");
      return;
    }

    // THEN: check existing login
    const existingToken = getToken();
    if (existingToken) {
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