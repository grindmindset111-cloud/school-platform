import { userSession } from "./userSession.js";
import { routeByRole } from "./roleRouter.js";

function redirectTo(path) {
  window.location.href = path;
}

export async function requireAuth(options = {}) {
  const {
    roles = [],
    redirectToLogin = "./login.html",
    denyOnWrongRole = true
  } = options;

  if (!userSession.hasSession()) {
    redirectTo(redirectToLogin);
    return null;
  }

  try {
    const user = await userSession.syncUser();
    const userRole = (user.role || "").toUpperCase();
    const allowedRoles = roles.map((role) => role.toUpperCase());

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      if (denyOnWrongRole) {
        alert("Access denied for your role.");
      }
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
