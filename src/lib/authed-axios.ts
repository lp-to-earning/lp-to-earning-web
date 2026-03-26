import axios, { type AxiosInstance } from "axios";
import { getApiBaseUrl } from "@/lib/api-url";
import { clearPrivateKeyRegistered } from "@/lib/private-key-registration";

export const AUTH_TOKEN_STORAGE_KEY = "auth_token";

export function notifyAuthTokenChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("lp-auth-token-changed"));
}

let authedInstance: AxiosInstance | null = null;

export function createPublicApi(): AxiosInstance {
  return axios.create({
    baseURL: getApiBaseUrl(),
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Browser-only axios instance: attaches JWT from localStorage and clears session on 401/403.
 */
export function getAuthedAxios(): AxiosInstance {
  if (typeof window === "undefined") {
    throw new Error("getAuthedAxios must run in the browser");
  }

  if (!authedInstance) {
    authedInstance = axios.create({
      baseURL: getApiBaseUrl(),
      headers: { "Content-Type": "application/json" },
    });

    authedInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    authedInstance.interceptors.response.use(
      (res) => res,
      (err) => {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
          clearPrivateKeyRegistered();
          notifyAuthTokenChanged();
          window.location.assign("/");
        }
        return Promise.reject(err);
      },
    );
  }

  return authedInstance;
}
