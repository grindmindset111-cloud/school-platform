import { authService } from "./authService.js";

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

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const role = roleSelect.value.toUpperCase();
    const classLevel = classLevelSelect.value;

    if (!email || !password || !role) {
      alert("All fields are required.");
      return;
    }

    const payload = { email, password, role, classLevel: "" };
    if (role === "STUDENT") {
      if (!classLevel) {
        alert("Please select a class level.");
        return;
      }
      payload.classLevel = classLevel;
    }

    try {
      const result = await authService.register(payload);
      if (result?.user && result?.token) {
        authService.routeUser(result.user);
        return;
      }
      window.location.href = "./login.html";
    } catch (error) {
      alert(error.message || "Registration failed.");
    }
  });
});
