import axios from 'axios';

export const API =
  process.env.NODE_ENV === 'production'
    ? 'https://your-production-api.com' //TODO
    : 'http://localhost:8000/';

export const makeRequest = axios.create({
  baseURL: API,
  withCredentials: true,
});
