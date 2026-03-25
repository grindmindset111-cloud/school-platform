document.addEventListener("DOMContentLoaded", () => {
  console.log("login.js loaded");

  const BASE_URL = "https://school-platform-bnpo.onrender.com";
  const form = document.getElementById("loginForm");

  if (!form) {
    console.error("Form not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // Handle BOTH possible backend formats
      const token = data?.data?.token || data?.token;

      if (!token) {
        alert("Token not received");
        return;
      }

      localStorage.setItem("token", token);

      window.location.href = "../pages/dashboard.html";

    } catch (err) {
      console.error("Login error:", err);
      alert("Network error");
    }
  });
});