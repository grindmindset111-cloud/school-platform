import { requireAuth } from "./authGuard.js";
import { bindLogout, injectLayout } from "./dashboardService.js";
import { apiRequest } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireAuth(["admin"]);
  if (!user) return;

  if (!injectLayout({ title: "Admin Dashboard" })) return;

  const dashboardContent = document.getElementById("dashboardContent");
  if (!dashboardContent) return;

  showLoader(dashboardContent);

  try {
    const data = await apiRequest("/dashboard");
    renderAdminDashboard(dashboardContent, data, user);
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

function showEmptyState(container, label) {
  container.innerHTML += `<div class="card"><p>No ${label} data available.</p></div>`;
}

function renderAdminDashboard(container, payload, user) {
  const users = payload?.tables?.users || [];
  const attendance = payload?.tables?.attendance || [];
  const statsHtml = renderStats(payload?.stats || {});
  const usersTableHtml = renderUsersTable(users);
  const attendanceTableHtml = renderAttendanceTable(attendance);

  container.innerHTML = `
    <h1>Admin Dashboard</h1>
    <p>Welcome, ${user.name} (${user.role})</p>
    ${statsHtml}
    ${usersTableHtml}
    ${attendanceTableHtml}
  `;

  if (!users.length) showEmptyState(container, "users");
  if (!attendance.length) showEmptyState(container, "attendance");
  bindAdminActions(container);
}

function renderStats(stats) {
  return `
    <section class="card">
      <h2>Stats</h2>
      <div>
        <p>Total Users: ${stats.users ?? 0}</p>
        <p>Attendance Rate: ${stats.attendance ?? 0}%</p>
      </div>
    </section>
  `;
}

function renderUsersTable(users) {
  if (!users.length) {
    return `<section class="card"><h2>Users Table</h2></section>`;
  }

  return `
    <section class="card">
      <h2>Users Table</h2>
      <table>
        <thead><tr><th>Name</th><th>Role</th><th>Class</th><th>Action</th></tr></thead>
        <tbody>
          ${users
            .map(
              (item) =>
                `<tr><td>${item.name}</td><td>${item.role}</td><td>${item.classLevel}</td><td><button type="button" data-action="view-user" data-id="${item.id}">View</button></td></tr>`
            )
            .join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderAttendanceTable(records) {
  if (!records.length) {
    return `<section class="card"><h2>Attendance Table</h2></section>`;
  }

  return `
    <section class="card">
      <h2>Attendance Table</h2>
      <table>
        <thead><tr><th>Student</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>
          ${records
            .map(
              (item) =>
                `<tr><td>${item.student}</td><td>${item.status}</td><td>${item.date}</td><td><button type="button" data-action="mark-attendance" data-id="${item.id}">Mark</button></td></tr>`
            )
            .join("")}
        </tbody>
      </table>
    </section>
  `;
}

function bindAdminActions(container) {
  container.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      alert("UI action only in mock mode.");
    });
  });
}
