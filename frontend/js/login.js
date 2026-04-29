import { authService } from "./authService.js";

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
      authService.routeUser(result.user);
    } catch (error) {
      alert(error.message || "Login failed.");
    }
  });
});
