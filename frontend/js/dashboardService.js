import { userSession } from "./userSession.js";
import { renderNavbar } from "../components/navbar.js";
import { renderSidebar } from "../components/sidebar.js";

export function bindLogout(buttonId, redirectPath = "./login.html") {
  const button = document.getElementById(buttonId);
  if (!button) return;

  button.addEventListener("click", async () => {
    await Promise.resolve();
    userSession.clear();
    window.location.href = redirectPath;
  });
}

export function injectLayout({ title = "Dashboard" } = {}) {
  const sidebar = document.getElementById("sidebar");
  const navbar = document.getElementById("navbar");
  if (!sidebar || !navbar) return false;

  sidebar.innerHTML = renderSidebar();
  navbar.innerHTML = renderNavbar({ title });
  return true;
}

export function getPageContent(containerId = "pageContent") {
  return document.getElementById(containerId);
}

export function renderLoading(container, message) {
  container.innerHTML = `<p>${message}</p>`;
}

export function renderError(container, message, error) {
  container.innerHTML = `<p>${message} ${error?.message || ""}</p>`;
}

export function renderEmpty(container, message) {
  container.innerHTML = `<p>${message}</p>`;
}
