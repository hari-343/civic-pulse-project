import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export const fetchGrievancesApi = (params) => api.get("/grievances", { params });
export const createGrievanceApi = (formData) => api.post("/grievances", formData);
export const updateStatusApi = (id, status) => api.patch(`/grievances/${id}/status`, { status });
export const resolveGrievanceApi = (id, formData) => api.patch(`/grievances/${id}/resolve`, formData);

export default api;
