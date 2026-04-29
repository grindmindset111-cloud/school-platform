import { requireAuth } from "./authGuard.js";
import { apiRequest } from "./api.js";
import {
  bindLogout,
  getPageContent,
  injectLayout,
  renderEmpty,
  renderError,
  renderLoading
} from "./dashboardService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireAuth(["admin", "student"]);
  if (!user) return;

  if (!injectLayout({ title: "Attendance" })) return;

  const pageContent = getPageContent();
  if (!pageContent) return;

  renderLoading(pageContent, "Loading attendance records...");

  try {
    const data = await apiRequest("/dashboard");
    renderAttendance(pageContent, data);
  } catch (error) {
    renderError(pageContent, "Unable to load attendance records.", error);
  }

  bindLogout("logoutBtn", "./login.html");
});

function renderAttendance(container, payload) {
  const records = payload?.tables?.attendance || [];
  if (!records.length) {
    renderEmpty(container, "No attendance records found.");
    return;
  }

  container.innerHTML = `
    <h1>Attendance</h1>
    <table>
      <thead><tr><th>Student</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>
        ${records
          .map((item) => `<tr><td>${item.student}</td><td>${item.status}</td><td>${item.date}</td></tr>`)
          .join("")}
      </tbody>
    </table>
  `;
}
