import { userSession } from "../js/userSession.js";

export function renderSidebar({ role = "USER" } = {}) {
  const resolvedRole = role === "USER" ? userSession.getRole() || role : role;
  const normalizedRole = String(resolvedRole || "USER").toUpperCase();

  const navItems =
    normalizedRole === "ADMIN"
      ? [
          { label: "Dashboard", href: "./admin-dashboard.html" },
          { label: "Reports", href: "./reports.html" },
          { label: "Settings", href: "./settings.html" }
        ]
      : [
          { label: "Dashboard", href: "./student-dashboard.html" },
          { label: "Attendance", href: "./attendance.html" },
          { label: "Timetable", href: "./timetable.html" }
        ];

  const links = navItems
    .map((item) => `<li><a href="${item.href}">${item.label}</a></li>`)
    .join("");

  return `
    <aside class="sidebar" id="sidebarMenu">
      <nav>
        <ul>${links}</ul>
      </nav>
    </aside>
  `;
}

/* =========================
   TOGGLE SYSTEM (CLEAN)
   ========================= */

let sidebarToggleBound = false;

function bindSidebarToggle() {
  if (sidebarToggleBound) return;
  sidebarToggleBound = true;

  document.addEventListener("click", (event) => {
    const target = event.target;

    const toggleButton = target.closest("#menu-toggle");
    const sidebar = document.querySelector("#sidebarMenu");

    if (!sidebar) return;

    // Toggle open/close
    if (toggleButton) {
      const isActive = sidebar.classList.toggle("active");
      toggleButton.setAttribute("aria-expanded", String(isActive));
      return;
    }

    // Close when clicking outside
    const clickedInsideSidebar = target.closest("#sidebarMenu");
    if (!clickedInsideSidebar) {
      sidebar.classList.remove("active");

      const menuButton = document.getElementById("menu-toggle");
      if (menuButton) {
        menuButton.setAttribute("aria-expanded", "false");
      }
    }
  });
}

/* =========================
   INIT (SAFE TIMING)
   ========================= */

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindSidebarToggle, { once: true });
  } else {
    bindSidebarToggle();
  }
}