export function renderSidebar({ role = "USER" } = {}) {
  const normalizedRole = role.toUpperCase();
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
