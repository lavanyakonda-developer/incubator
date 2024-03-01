import axios from "axios";

// export const API =
//   process.env.NODE_ENV === "production"
//     ? "https://your-production-api.com" //TODO
//     : "http://localhost:8000/";

// export const socketAPI =
//   process.env.NODE_ENV === "production"
//     ? "https://your-production-api.com" //TODO
//     : "http://localhost:3001";

export const API = "http://35.154.239.8:8000/";
export const socketAPI = "http://35.154.239.8:3001";

export const makeRequest = axios.create({
  baseURL: API,
  withCredentials: true,
});
