import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request: attach access token ─────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: auto refresh on 401 ───────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
        processQueue(null, data.access_token);
        return api(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ── API helpers ─────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: any) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, new_password: string) =>
    api.post("/auth/reset-password", { token, new_password }),
};

export const dashboardApi = {
  stats: () => api.get("/dashboard/stats"),
};

export const journalsApi = {
  list: (params?: any) => api.get("/journals", { params }),
  get: (id: number) => api.get(`/journals/${id}`),
  create: (data: any) => api.post("/journals", data),
  update: (id: number, data: any) => api.patch(`/journals/${id}`, data),
  delete: (id: number) => api.delete(`/journals/${id}`),
};

export const backupsApi = {
  list: (params?: any) => api.get("/backups", { params }),
  get: (id: number) => api.get(`/backups/${id}`),
  create: (journal_id: number) => api.post("/backups", { journal_id }),
  delete: (id: number) => api.delete(`/backups/${id}`),
};

export const alertsApi = {
  list: (params?: any) => api.get("/alerts", { params }),
  unreadCount: () => api.get("/alerts/unread-count"),
  markRead: (id: number) => api.patch(`/alerts/${id}/read`),
  markAllRead: () => api.patch("/alerts/read-all"),
  resolve: (id: number) => api.patch(`/alerts/${id}/resolve`),
  delete: (id: number) => api.delete(`/alerts/${id}`),
};

export const connectionsApi = {
  list: () => api.get("/connections"),
  get: (id: number) => api.get(`/connections/${id}`),
  create: (data: any) => api.post("/connections", data),
  update: (id: number, data: any) => api.patch(`/connections/${id}`, data),
  test: (id: number) => api.post(`/connections/${id}/test`),
  delete: (id: number) => api.delete(`/connections/${id}`),
};

export const usersApi = {
  list: () => api.get("/users"),
  get: (id: number) => api.get(`/users/${id}`),
  create: (data: any) => api.post("/users", data),
  update: (id: number, data: any) => api.patch(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};