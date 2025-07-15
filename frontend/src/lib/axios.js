import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5001/api"
      : "/api",
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理token刷新
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (error.response?.data?.code === "ACCESS_TOKEN_EXPIRED") {
        try {
          await axiosInstance.post("/auth/refresh");

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.log("Token refresh failed:", refreshError);

          handleAuthFailure();
          return Promise.reject(refreshError);
        }
      }

      // 处理没有access token的情况
      if (
        error.response?.data?.message ===
        "Unauthorized - No Access Token Provided"
      ) {
        try {
          await axiosInstance.post("/auth/refresh");

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.log("No access token, refresh failed:", refreshError);

          handleAuthFailure();
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// 处理认证失败的统一函数
function handleAuthFailure() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth-storage");

    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }
}
