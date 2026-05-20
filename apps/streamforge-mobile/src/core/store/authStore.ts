// ============================================================
//  Auth Store — user session, login, logout
// ============================================================

import { create } from "zustand";
import { authApi, userApi } from "@streamforge/api-contract";
import type { UserWithSubscription } from "@streamforge/api-contract";
import { useTokenStore } from "./tokenStore";
import { getStorage } from "../storage/mmkvStorage";

const STORAGE_ID = "streamforge-auth";

function authStorage() {
  return getStorage(STORAGE_ID);
}

function persistTokens(
  accessToken: string,
  refreshToken: string | undefined,
  expiresIn: number,
) {
  useTokenStore
    .getState()
    .setTokens(accessToken, refreshToken ?? "", expiresIn);
}

interface AuthState {
  user: UserWithSubscription | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isInitialised: boolean;

  login: (
    identifier: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: UserWithSubscription) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,
  isInitialised: false,

  login: async (identifier, password, rememberMe = false) => {
    set({ isLoading: true });
    try {
      const result = await authApi.login({ identifier, password, rememberMe });
      persistTokens(result.accessToken, result.refreshToken, result.expiresIn);

      const user = await userApi.getMe();
      authStorage().set("user", JSON.stringify(user));
      set({ user, isLoggedIn: true });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, username, password, displayName) => {
    set({ isLoading: true });
    try {
      const result = await authApi.register({
        email,
        username,
        password,
        displayName,
      });
      persistTokens(result.accessToken, result.refreshToken, result.expiresIn);

      const user = await userApi.getMe();
      authStorage().set("user", JSON.stringify(user));
      set({ user, isLoggedIn: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const refreshToken = useTokenStore.getState().refreshToken ?? undefined;
    await authApi.logout(refreshToken).catch(() => {});
    useTokenStore.getState().clearTokens();
    authStorage().delete("user");
    set({ user: null, isLoggedIn: false });
  },

  loadUser: async () => {
    useTokenStore.getState().hydrateFromStorage();

    const storage = authStorage();
    const cached = storage.getString("user");
    if (cached) {
      set({ user: JSON.parse(cached), isLoggedIn: true });
    }

    const token = useTokenStore.getState().accessToken;
    if (token) {
      try {
        const user = await userApi.getMe();
        storage.set("user", JSON.stringify(user));
        set({ user, isLoggedIn: true });
      } catch {
        if (!cached) set({ isLoggedIn: false });
      }
    }

    set({ isInitialised: true });
  },

  setUser: (user) => {
    authStorage().set("user", JSON.stringify(user));
    set({ user });
  },
}));
