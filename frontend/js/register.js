import { authService } from "./authService.js";
import { userSession } from "./userSession.js";
import { routeByRole } from "./roleRouter.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const roleSelect = document.getElementById("role");
  const classLevelField = document.getElementById("classLevelField");
  const classLevelSelect = document.getElementById("classLevel");

  if (!form || !roleSelect || !classLevelField || !classLevelSelect) return;

  classLevelField.style.display = "none";

  roleSelect.addEventListener("change", () => {
    const isStudent = roleSelect.value === "STUDENT";
    classLevelField.style.display = isStudent ? "block" : "none";
    if (!isStudent) classLevelSelect.value = "";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const role = roleSelect.value.toUpperCase();
    const classLevelId = classLevelSelect.value;

    if (!name || !email || !password || !role) {
      alert("All fields are required.");
      return;
    }

    const payload = { name, email, password, role };
    if (role === "STUDENT") {
      if (!classLevelId) {
        alert("Please select a class level.");
        return;
      }
      payload.classLevelId = Number(classLevelId);
    }

    try {
      const result = await authService.register(payload);
      const token = result?.data?.token || result?.token || null;
      const user = result?.data?.user || result?.user || null;

      if (!token) {
        window.location.href = "./login.html";
        return;
      }

      userSession.setToken(token);
      if (user) userSession.setUser(user);

      const activeUser = user || (await userSession.syncUser());
      routeByRole(activeUser.role);
    } catch (error) {
      alert(error.message || "Registration failed.");
    }
  });
});
