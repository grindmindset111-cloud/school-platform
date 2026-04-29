import { api } from "./api.js";

const TOKEN_KEY = "token";
const USER_KEY = "currentUser";

function parseUser(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export const userSession = {
  setToken(token) {
    if (!token) return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setUser(user) {
    if (!user) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser() {
    return parseUser(localStorage.getItem(USER_KEY));
  },

  hasSession() {
    return Boolean(this.getToken());
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getRole() {
    return (this.getUser()?.role || "").toUpperCase();
  },

  async syncUser() {
    const token = this.getToken();
    if (!token) throw new Error("No active session.");

    const result = await api.get("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const user = result?.data?.user || result?.user || null;
    if (!user) throw new Error("Invalid user payload.");

    this.setUser(user);
    return user;
  }
};
