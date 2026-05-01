export const getToken = () => {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    // check expiry
    if (payload.exp * 1000 < Date.now()) {
      logout();
      return null;
    }

    return token;

  } catch (err) {
    console.error("Invalid token");
    logout();
    return null;
  }
};

export const setToken = (token) => {
  localStorage.setItem("token", token);
};

export const logout = () => {
  localStorage.removeItem("token");

  // better than hard reload if using React Router
  window.location.href = "/";
};