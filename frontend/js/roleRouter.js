const DASHBOARD_BY_ROLE = {
  ADMIN: "./admin-dashboard.html",
  STUDENT: "./student-dashboard.html"
};

export function getDashboardPathByRole(role) {
  const normalizedRole = (role || "").toUpperCase();
  return DASHBOARD_BY_ROLE[normalizedRole] || "./login.html";
}

export function routeByRole(role) {
  window.location.href = getDashboardPathByRole(role);
}
