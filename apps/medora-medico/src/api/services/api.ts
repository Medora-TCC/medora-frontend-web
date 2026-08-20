import axios from "axios";

export const api = axios.create({
    baseURL: "https://localhost:7069/api",
    withCredentials: true
})