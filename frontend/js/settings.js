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

  if (!injectLayout({ title: "Settings" })) return;

  const pageContent = getPageContent();
  if (!pageContent) return;

  renderLoading(pageContent, "Loading settings...");

  try {
    const data = await apiRequest("/dashboard");
    renderSettings(pageContent, data, user);
  } catch (error) {
    renderError(pageContent, "Unable to load settings.", error);
  }

  bindLogout("logoutBtn", "./login.html");
});

function renderSettings(container, payload, user) {
  const stats = payload?.stats;
  if (!stats) {
    renderEmpty(container, "No settings data available.");
    return;
  }

  container.innerHTML = `
    <h1>Settings</h1>
    <section class="card">
      <p>Current User: ${user.name}</p>
      <p>Role: ${user.role}</p>
      <p>System Attendance Snapshot: ${stats.attendance ?? 0}%</p>
    </section>
  `;
}
