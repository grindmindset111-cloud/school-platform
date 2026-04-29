import { requireAuth } from "./authGuard.js";
import { routeByRole } from "./roleRouter.js";

document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireAuth({ redirectToLogin: "./login.html" });
  if (!user) return;
  routeByRole(user.role);
});
