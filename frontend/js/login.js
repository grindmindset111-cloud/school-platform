import { authService } from "./authService.js";
import { userSession } from "./userSession.js";
import { routeByRole } from "./roleRouter.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!email || !password) {
      alert("Fill all fields.");
      return;
    }

    try {
      const result = await authService.login({ email, password });
      const token = result?.data?.token || result?.token;
      const user = result?.data?.user || result?.user || null;

      if (!token) {
        throw new Error("Authentication failed. No token received.");
      }

      userSession.setToken(token);
      if (user) userSession.setUser(user);

      const activeUser = user || (await userSession.syncUser());
      routeByRole(activeUser.role);
    } catch (error) {
      alert(error.message || "Login failed.");
    }
  });
});
