import axios from "axios";

const API_BASE_URL = "https://zhagaram-backend-nuuv.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("zhagaram_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // localStorage.removeItem('zhagaram_token');
      // localStorage.removeItem('zhagaram_user');
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getMe: () => api.get("/auth/me"),
  toggleCheckIn: () => api.post("/auth/toggle-checkin"),
};

export const enquiriesAPI = {
  getAll: (params) => api.get("/enquiries", { params }),
  getById: (id) => api.get(`/enquiries/${id}`),
  create: (data) => api.post("/enquiries", data),
  update: (id, data) => api.put(`/enquiries/${id}`, data),
  moveToOrder: (id, payload) =>
    api.post(`/enquiries/${id}/move-to-order`, payload || {}),
  moveToCompleted: (id, payload) =>
    api.post(`/enquiries/${id}/move-to-completed`, payload || {}),
  recordQuoteSent: (id, payload) =>
    api.post(`/enquiries/${id}/send-quote`, payload || {}),
  updatePayment: (id, data) => api.patch(`/enquiries/${id}/payment`, data),
  delete: (id) => api.delete(`/enquiries/${id}`),
  getDashboardStats: () => api.get("/enquiries/stats/dashboard"),
};

export const packagesAPI = {
  get: () => api.get("/packages"),
  update: (data) => api.put("/packages", data),
  calculate: (data) => api.post("/packages/calculate", data),
};

export const revisionsAPI = {
  getAll: (params) => api.get("/revisions", { params }),
  create: (data) => api.post("/revisions", data),
  update: (id, data) => api.put(`/revisions/${id}`, data),
  delete: (id) => api.delete(`/revisions/${id}`),
};

export default api;
