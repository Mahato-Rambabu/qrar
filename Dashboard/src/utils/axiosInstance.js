const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://qrar.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});