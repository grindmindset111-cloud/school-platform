document.addEventListener("DOMContentLoaded", () => {
  console.log("login.js loaded");

  const BASE_URL = "https://school-platform-bnpo.onrender.com";
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.data.token);

      window.location.href = "../pages/dashboard.html";

    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  });
});