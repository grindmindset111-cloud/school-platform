import { api } from "./api.js";

export const authService = {
  login(credentials) {
    return api.post("/api/auth/login", credentials);
  },
  register(payload) {
    return api.post("/api/auth/register", payload);
  },
  logout() {
    return Promise.resolve();
  }
};
