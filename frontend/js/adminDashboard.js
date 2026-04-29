import { requireAuth } from "./authGuard.js";
import { bindLogout } from "./dashboardService.js";
import { renderNavbar } from "../components/navbar.js";
import { renderSidebar } from "../components/sidebar.js";

document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireAuth({
    roles: ["ADMIN"],
    redirectToLogin: "./login.html"
  });
  if (!user) return;

  const shell = document.getElementById("dashboardShell");
  if (shell) {
    shell.innerHTML = `
      ${renderSidebar({ role: user.role })}
      <main class="content">
        ${renderNavbar({ title: "Admin Dashboard" })}
        <section class="card">
          <h1>Admin Dashboard</h1>
          <p id="welcomeMessage"></p>
        </section>
      </main>
    `;

    const welcomeMessage = document.getElementById("welcomeMessage");
    if (welcomeMessage) {
      welcomeMessage.textContent = `Welcome, ${user.name} (${user.role})`;
    }
  }

  bindLogout("logoutBtn", "./login.html");
});
