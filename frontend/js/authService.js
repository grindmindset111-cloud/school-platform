import { apiRequest } from "./api.js";
import { routeByRole } from "./roleRouter.js";
import { userSession } from "./userSession.js";

function mapAuthResponse(payload) {
  const normalized = payload?.data || payload || {};
  return {
    user: normalized.user || null,
    token: normalized.token || null,
    message: normalized.message || payload?.message || null
  };
}

function saveUserSession(user, token) {
  if (!user || !token) {
    throw new Error("Invalid authentication response.");
  }
  userSession.setUser(user, token);
}

export function routeUser(user) {
  if (!user?.role) {
    throw new Error("Cannot route user without role.");
  }
  routeByRole(user.role);
}

export async function login(data) {
  const res = await apiRequest("/login", {
    method: "POST",
    body: JSON.stringify({
      email: data.email,
      password: data.password
    })
  });

  const mapped = mapAuthResponse(res);
  saveUserSession(mapped.user, mapped.token);
  return mapped;
}

export async function register(data) {
  const res = await apiRequest("/register", {
    method: "POST",
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      role: data.role,
      classLevel: data.classLevel
    })
  });

  return mapAuthResponse(res);
}

export async function logout() {
  userSession.clearUser();
  return Promise.resolve();
}

export const authService = { login, register, logout, routeUser };
