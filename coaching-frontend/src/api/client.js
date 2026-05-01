import { getToken, logout } from "../auth/auth";

const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(
  endpoint,
  method = "GET",
  body = null,
  params = null
) {
  try {
    const token = getToken();

    // 🔹 build query string
    let url = `${BASE_URL}${endpoint}`;

    if (params) {
      const query = new URLSearchParams(params).toString();
      url += `?${query}`;
    }

    const options = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // only add body for non-GET
    if (body && method !== "GET") {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    // 🔹 timeout (10s)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // auth handling
    if (res.status === 401) {
      logout();
      throw new Error("Unauthorized");
    }

    if (res.status === 403) {
      window.dispatchEvent(new Event("show-upgrade"));
      throw new Error("Upgrade required");
    }

    //  error handling
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Request failed");
    }

    return await res.json();

  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("Request timeout");
    }

    console.error("API ERROR:", e.message);
    throw e;
  }
}