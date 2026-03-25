document.addEventListener("DOMContentLoaded", async () => {
  console.log("dashboard.js loaded");

  const BASE_URL = "https://school-platform-bnpo.onrender.com";
  const token = localStorage.getItem("token");

  // 🔥 ACCESS CONTROL
  if (!token) {
    window.location.href = "./login.html";
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      // Token invalid or expired
      localStorage.removeItem("token");
      window.location.href = "./login.html";
      return;
    }

    const user = data.data.user;

    // Display user info
    document.getElementById("welcomeMessage").textContent =
      `Welcome, ${user.name} (${user.role})`;

  } catch (error) {
    console.error("Dashboard error:", error);
    alert("Network error.");
  }

  // 🔥 LOGOUT CONTROL
  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "./login.html";
  });
});