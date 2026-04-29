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
    <aside class="sidebar">
      <nav>
        <ul>${links}</ul>
      </nav>
    </aside>
  `;
}
