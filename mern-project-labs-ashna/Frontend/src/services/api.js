import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8002",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

export default apiClient;
