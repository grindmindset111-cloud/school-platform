import { requireAuth } from "./authGuard.js";
import { routeByRole } from "./roleRouter.js";

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.querySelector(".card");
  if (page) {
    page.innerHTML = "<h1>Routing...</h1><p>Loading your session.</p>";
  }

  try {
    const user = await requireAuth({ redirectToLogin: "./login.html" });
    if (!user) return;
    routeByRole(user.role);
  } catch (error) {
    if (page) {
      page.innerHTML = "<h1>Routing failed</h1><p>Please log in again.</p>";
    }
  }
});
