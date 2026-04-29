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
  const user = await requireAuth(["admin"]);
  if (!user) return;

  if (!injectLayout({ title: "Reports" })) return;

  const pageContent = getPageContent();
  if (!pageContent) return;

  renderLoading(pageContent, "Loading reports...");

  try {
    const data = await apiRequest("/dashboard");
    renderReports(pageContent, data);
  } catch (error) {
    renderError(pageContent, "Unable to load reports.", error);
  }

  bindLogout("logoutBtn", "./login.html");
});

function renderReports(container, payload) {
  const stats = payload?.stats;
  if (!stats) {
    renderEmpty(container, "No report data available.");
    return;
  }

  container.innerHTML = `
    <h1>Reports</h1>
    <section class="card">
      <p>Users: ${stats.users ?? 0}</p>
      <p>Attendance: ${stats.attendance ?? 0}%</p>
    </section>
  `;
}
