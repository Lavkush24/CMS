import { useEffect } from "react";
import { setToken } from "../auth/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (token) {
      setToken(token);
      navigate("/dashboard");
    }
  }, []);

  return (
    <div style={styles.container}>
      <h1>Coaching Manager</h1>
      <button onClick={() => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/login`;
      }}>
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