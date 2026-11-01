import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5262/api",
    withCredentials: true
})
