import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";
import { authApi } from "../lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login(email, password);
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          const meRes = await authApi.me();
          set({ user: meRes.data, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({ user: null, isAuthenticated: false });
        window.location.href = "/login";
      },

      fetchMe: async () => {
        try {
          const { data } = await authApi.me();
          set({ user: data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);