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

  setUser(user, token) {
    if (!user || typeof user !== "object" || Array.isArray(user) || !token) {
      throw new Error("Invalid session payload.");
    }

    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      this.clearUser();
      throw error;
    }
  },

  getUser() {
    const token = this.getToken();
    const user = parseUser(localStorage.getItem(USER_KEY));
    const isValidUser = Boolean(user && typeof user === "object" && !Array.isArray(user));

    if (!token || !isValidUser) {
      this.clearUser();
      return null;
    }

    return user;
  },

  hasSession() {
    return Boolean(this.getToken() && this.getUser());
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  clearUser() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getRole() {
    return (this.getUser()?.role || "").toUpperCase();
  },

  async syncUser() {
    const token = this.getToken();
    if (!token) throw new Error("No active session.");

    const cachedUser = this.getUser();
    if (cachedUser?.role) {
      return cachedUser;
    }

    const result = await api.get("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const user = result?.data?.user || result?.user || null;
    if (!user) throw new Error("Invalid user payload.");

    this.setUser(user, token);
    return user;
  }
};
