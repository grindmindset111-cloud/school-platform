document.addEventListener("DOMContentLoaded", () => {
  console.log("register.js loaded");

  const BASE_URL = "https://school-platform-bnpo.onrender.com";
  const form = document.getElementById("registerForm");
  const roleSelect = document.getElementById("role");
  const classLevelField = document.getElementById("classLevelField");
  const classLevelSelect = document.getElementById("classLevel");

  if (!form) {
    console.error("registerForm not found");
    return;
  }

  if (!roleSelect) {
    console.error("role select not found");
    return;
  }

  // Hide class level by default
  if (classLevelField) {
    classLevelField.style.display = "none";
  }

  // Show class level only for STUDENT
  roleSelect.addEventListener("change", () => {
    const selectedRole = roleSelect.value;

    if (selectedRole === "STUDENT") {
      if (classLevelField) {
        classLevelField.style.display = "block";
      }
    } else {
      if (classLevelField) {
        classLevelField.style.display = "none";
      }

      if (classLevelSelect) {
        classLevelSelect.value = "";
      }
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const role = roleSelect.value;
    const classLevelId = classLevelSelect?.value;

    if (!name || !email || !password || !role) {
      alert("All fields are required.");
      return;
    }

    const payload = {
      name,
      email,
      password,
      role: role.toUpperCase()
    };

    // Only STUDENT requires classLevelId
    if (payload.role === "STUDENT") {
      if (!classLevelId) {
        alert("Please select a class level.");
        return;
      }

      payload.classLevelId = Number(classLevelId);
    }

    console.log("Sending payload:", payload);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log("REGISTER RESPONSE:", data);

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      const token = data?.data?.token || data?.token;

      if (token) {
        localStorage.setItem("token", token);
        window.location.href = "../pages/dashboard.html";
      } else {
        window.location.href = "../pages/login.html";
      }

    } catch (error) {
      console.error("Registration error:", error);
      alert("Network error");
    }
  });
});