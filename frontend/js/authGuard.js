import { userSession } from "./userSession.js";
import { routeByRole } from "./roleRouter.js";

function redirectTo(path) {
  window.location.href = path;
}

export async function requireAuth(options = {}) {
  const normalizedOptions = Array.isArray(options) ? { roles: options } : options;
  const { roles = [], redirectToLogin = "./login.html" } = normalizedOptions;
  const allowedRoles = roles.map((role) => String(role).toUpperCase());

  if (!userSession.hasSession()) {
    userSession.clear();
    redirectTo(redirectToLogin);
    return null;
  }

  try {
    const user = await userSession.syncUser();
    const userRole = (user.role || "").toUpperCase();
    if (!userRole) {
      throw new Error("Invalid session role.");
    }
    if (!["ADMIN", "STUDENT"].includes(userRole)) {
      throw new Error("Unknown session role.");
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      routeByRole(userRole);
      return null;
    }

    return user;
  } catch (error) {
    userSession.clear();
    redirectTo(redirectToLogin);
    return null;
  }
}
