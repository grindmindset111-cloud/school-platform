document.addEventListener("DOMContentLoaded", () => {
  console.log("register.js loaded");

  const BASE_URL = "https://school-platform-bnpo.onrender.com";
  const form = document.getElementById("registerForm");

  if (!form) {
    console.error("registerForm not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const role = document.getElementById("role")?.value;

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

    // Students require classLevelId
    if (role.toUpperCase() === "STUDENT") {
      payload.classLevelId = 1;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      // Trust HTTP status
      if (!response.ok) {
        alert(data.message || "Registration failed.");
        return;
      }

      const token = data?.data?.token;

      if (token) {
        localStorage.setItem("token", token);
        window.location.href = "./dashboard.html";
      } else {
        window.location.href = "./login.html";
      }

    } catch (error) {
      console.error("Registration error:", error);
      alert("Network error. Backend may be sleeping.");
    }
  });
});