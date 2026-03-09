import { create } from "zustand";
import type { AuthUser } from "@/types/auth";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  setAuth: (payload: { accessToken: string; user: AuthUser }) => void;
  logout: () => void;
};

const ACCESS_TOKEN_KEY = "recommendation.accessToken";

const USER_KEY = "recommendation.user";

function getStoredToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getStoredUser(): AuthUser | null {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getStoredToken(),
  user: getStoredUser(),

  setAuth: ({ accessToken, user }) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    set({
      accessToken,
      user,
    });
  },

  logout: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    set({
      accessToken: null,
      user: null,
    });
  },
}));