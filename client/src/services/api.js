import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000', // Your server's URL
});

// You can add interceptors here later if you use JWT tokens, etc.

export default api;