import axios from "axios";
import { useAuthStore } from "./store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const userId = useAuthStore.getState().user?.id;

        if (!refreshToken || !userId) {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {
            userId,
            refreshToken,
          },
        );

        useAuthStore
          .getState()
          .setTokens(data.access_token, data.refresh_token);
        api.defaults.headers.common["Authorization"] =
          `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (err) {
        useAuthStore.getState().logout();
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  },
);
