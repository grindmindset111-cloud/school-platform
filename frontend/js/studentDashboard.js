import { requireAuth } from "./authGuard.js";
import { bindLogout, injectLayout } from "./dashboardService.js";
import { apiRequest } from "./api.js";
import { renderSidebar } from "../components/sidebar.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Load Navbar FIRST
  const navbarHTML = await fetch('../components/Navbar.html')
    .then(res => res.text());

  document.getElementById('navbar').innerHTML = navbarHTML;

  // 2. Inject Sidebar AFTER navbar (ensures DOM consistency)
  document.getElementById("sidebar").innerHTML = renderSidebar();

  setTimeout(() => {
    const toggleBtn = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("sidebarMenu");
  
    if (!toggleBtn || !sidebar) return;
  
    toggleBtn.onclick = () => {
      sidebar.classList.toggle("active");
    };
  }, 50);

  // 3. Bind sidebar toggle AFTER elements exist
  bindSidebarToggle();

  // 4. Auth + layout
  const user = await requireAuth(["student"]);
  if (!user) return;

  if (!injectLayout({ title: "Student Dashboard" })) return;

  const dashboardContent = document.getElementById("dashboardContent");
  if (!dashboardContent) return;

  // 5. Load data
  showLoader(dashboardContent);

  try {
    const data = await apiRequest("/dashboard");
    console.log(data);
    renderStudentDashboard(dashboardContent, data, user);
  } catch (error) {
    showError(dashboardContent, error);
  }

  bindLogout("logoutBtn", "./login.html");
});


// ===== SIDEBAR CONTROL (moved here for precision) =====
function bindSidebarToggle() {
  const toggleBtn = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebarMenu");

  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
}


// ===== UI STATES =====
function showLoader(container) {
  container.innerHTML = `<p>Loading dashboard data...</p>`;
}

function showError(container, error) {
  container.innerHTML = `<p>Could not load dashboard. ${error?.message || ""}</p>`;
}

function showEmptyState(container) {
  container.innerHTML = `<p>No dashboard data available.</p>`;
}


// ===== RENDER =====
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