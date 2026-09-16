import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7069/api",
    withCredentials: true
})
