// Axios HTTP client and API service functions
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Bearer token if present
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

// Response interceptor: redirect to login on 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest =
      error.config &&
      error.config.url &&
      (error.config.url.includes("/login") || error.config.url.includes("/usercheck"));
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Helper to normalize error messages from server or network
export const getErrorMessage = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.code === "ECONNABORTED" || !error.response) {
    return "Cannot reach the server. Check your connection.";
  }
  return "Something went wrong. Please try again.";
};

// Auth API: uses /usercheck/login
export const loginApi = (credentials) =>
  api.post("/usercheck/login", credentials).catch((err) => {
    if (err.response && err.response.status === 404) {
      return api.post("/auth/login", credentials).catch((err2) => {
        if (err2.response && err2.response.status === 404) {
          return api.post("/api/auth/login", credentials);
        }
        return Promise.reject(err2);
      });
    }
    return Promise.reject(err);
  });

// Dashboard API
export const getDashboardApi = () => api.get("/dashboard/summary");

// Leads API
export const getLeadsApi = (params) => api.get("/leads", { params });
export const createLeadApi = (leadData) => api.post("/leads", leadData);
export const updateLeadApi = (id, leadData) => api.put(`/leads/${id}`, leadData);
export const deleteLeadApi = (id) => api.delete(`/leads/${id}`);

// Companies API
export const getCompaniesApi = (params) => api.get("/companies", { params });
export const getCompanyLeadsApi = (id) => api.get(`/companies/${id}/leads`);
export const createCompanyApi = (companyData) => api.post("/companies", companyData);
export const updateCompanyApi = (id, companyData) => api.put(`/companies/${id}`, companyData);
export const deleteCompanyApi = (id) => api.delete(`/companies/${id}`);

// Tasks API
export const getTasksApi = (params) => api.get("/tasks", { params });
export const createTaskApi = (taskData) => api.post("/tasks", taskData);
export const updateTaskApi = (id, taskData) => api.put(`/tasks/${id}`, taskData);
export const updateTaskStatusApi = (id, status) => api.patch(`/tasks/${id}/status`, { status });
export const deleteTaskApi = (id) => api.delete(`/tasks/${id}`);

// Users & Dropdowns API
export const getUsersApi = () => api.get("/users");

export default api;
