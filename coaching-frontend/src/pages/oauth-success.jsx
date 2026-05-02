import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setToken } from "../auth/auth";

function OAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    console.log("OAuthSuccess token:", token);

    if (token) {
      setToken(token);

      // clean URL
      window.history.replaceState({}, document.title, "/");

      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

  return <div>Logging you in...</div>;
}

export default OAuthSuccess;