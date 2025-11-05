import axios from "axios";

export const baseURL = "https://pedxo-back-project.onrender.com";

// Simple in-memory cache for GET requests
const cache = new Map();

const authFetch = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor: adds auth token and handles caching
authFetch.interceptors.request.use(
  (config) => {
    // Attach Authorization token if available
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Cache GET requests (valid for 5 minutes)
    if (config.method?.toLowerCase() === "get") {
      const cacheKey = JSON.stringify({
        url: config.url,
        params: config.params,
      });

      if (cache.has(cacheKey)) {
        const { timestamp, data } = cache.get(cacheKey);
        if (Date.now() - timestamp < 300000) {
          return Promise.reject({
            response: { data },
            config,
            isCached: true,
          });
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: stores GET responses in cache and handles retries
authFetch.interceptors.response.use(
  (response) => {
    if (response.config.method?.toLowerCase() === "get") {
      const cacheKey = JSON.stringify({
        url: response.config.url,
        params: response.config.params,
      });
      cache.set(cacheKey, {
        timestamp: Date.now(),
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    if (error.isCached) {
      return Promise.resolve(error.response);
    }

    if (error.response) {
      console.error(
        "Error Response:",
        error.response.status,
        error.response.config.url
      );
    } else {
      console.error("Error:", error.message);
    }

    // Retry once for non-timeout errors
    const originalRequest = error.config;
    if (error.code !== "ECONNABORTED" && !originalRequest._retry) {
      originalRequest._retry = true;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return authFetch(originalRequest);
    }

    return Promise.reject(error);
  }
);

//  Named export for contract fetching with username filtering
export async function getUserContracts(username) {
  const response = await authFetch.get("/contracts/get-user-contracts", {
    params: { username },
  });
  return response.data;
}

export default authFetch;