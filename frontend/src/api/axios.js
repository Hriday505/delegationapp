import axios from "axios";

function normalizeApiBaseUrl(rawBaseUrl) {
  const fallback = "http://localhost:5000/api";
  const raw = String(rawBaseUrl || "").trim();
  const base = raw.length ? raw : fallback;

  const withoutTrailingSlash = base.replace(/\/+$/, "");

  if (withoutTrailingSlash.endsWith("/api")) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
}

const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
