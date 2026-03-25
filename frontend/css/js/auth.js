document.addEventListener("DOMContentLoaded", () => {
  console.log("auth.js loaded");

  const BASE_URL = "https://school-platform-bnpo.onrender.com";
  const form = document.getElementById("loginForm");

  if (!form) {
    console.error("loginForm not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const email = emailInput?.value.trim();
    const password = passwordInput?.value.trim();

    if (!email || !password) {
      alert("Email and password are required.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      // Enforce contract discipline
      if (!response.ok || !data.success) {
        alert(data?.message || "Login failed.");
        return;
      }

      const token = data?.data?.token;

      if (!token) {
        alert("Authentication failed. No token received.");
        return;
      }

      // Store token securely
      localStorage.setItem("token", token);

      // Controlled redirect
      window.location.href = "./dashboard.html";

    } catch (error) {
      console.error("Login error:", error);
      alert("Network error. Check backend.");
    }
  });
});