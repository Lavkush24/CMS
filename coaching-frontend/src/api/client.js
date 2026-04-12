import { getToken, logout } from "../auth/auth";

const BASE_URL = import.meta.env.VITE_API_URL;  ;

export async function apiRequest(endpoint, method = "GET", body = null) {
  try {

      const token = getToken();
    
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: body ? JSON.stringify(body) : null
      });
    
      if (res.status === 401) {
        logout();
        throw new Error("Unauthorized"); 
      }

      if (res.status === 403) {
        window.dispatchEvent(new Event("show-upgrade"));
        throw new Error("Upgrade required"); 
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Request failed");
      }

      return await res.json();
  }
  catch(e) {
    console.error("API ERROR:", e.message);
    throw e;
  }
}