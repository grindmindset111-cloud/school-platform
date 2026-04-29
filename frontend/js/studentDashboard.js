import { requireAuth } from "./authGuard.js";
import { bindLogout, injectLayout } from "./dashboardService.js";
import { apiRequest } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireAuth(["student"]);
  if (!user) return;

  if (!injectLayout({ title: "Student Dashboard" })) return;

  const dashboardContent = document.getElementById("dashboardContent");
  if (!dashboardContent) return;

  showLoader(dashboardContent);
  try {
    const data = await apiRequest("/dashboard");
    renderStudentDashboard(dashboardContent, data, user);
  } catch (error) {
    showError(dashboardContent, error);
  }

  bindLogout("logoutBtn", "./login.html");
});

function showLoader(container) {
  container.innerHTML = `<p>Loading dashboard data...</p>`;
}

function showError(container, error) {
  container.innerHTML = `<p>Could not load dashboard. ${error?.message || ""}</p>`;
}

function showEmptyState(container) {
  container.innerHTML = `<p>No dashboard data available.</p>`;
}

function renderStudentDashboard(container, payload, user) {
  const hasStats = Boolean(payload?.stats);
  if (!hasStats) {
    showEmptyState(container);
    return;
  }

  container.innerHTML = `
    <h1>Student Dashboard</h1>
    <section class="card">
      <h2>User Info</h2>
      <p>Name: ${user.name}</p>
      <p>Role: ${user.role}</p>
    </section>
    <section class="card">
      <h2>Attendance Summary</h2>
      <p>Attendance Rate: ${payload.stats.attendance}%</p>
    </section>
  `;
}
