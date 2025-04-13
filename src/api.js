// src/api.js

import axios from "axios";
// import checkBaseUrl from "./checkBaseUrl.js";
// const { BACKEND_BASE_API_URL } = checkBaseUrl();

 
const API = axios.create({
  baseURL: `http://localhost:5500/api`, // Backend base URL
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Retrieve token from local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
