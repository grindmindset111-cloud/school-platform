export function renderNavbar({ title = "Dashboard" } = {}) {
  return `
    <header class="navbar">
      <h2>${title}</h2>
      <button id="logoutBtn" type="button">Logout</button>
    </header>
  `;
}
