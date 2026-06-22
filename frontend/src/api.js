const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem("threew-auth");
    const auth = raw ? JSON.parse(raw) : null;

    if (!auth?.token || !auth?.user?.username) {
      localStorage.removeItem("threew-auth");
      return null;
    }

    return auth;
  } catch {
    localStorage.removeItem("threew-auth");
    return null;
  }
};

export const storeAuth = (auth) => {
  localStorage.setItem("threew-auth", JSON.stringify(auth));
};

export const clearAuth = () => {
  localStorage.removeItem("threew-auth");
};

export const request = async (path, options = {}) => {
  const auth = getStoredAuth();
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (auth?.token) {
    headers.set("Authorization", `Bearer ${auth.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};
