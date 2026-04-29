import { userSession } from "./userSession.js";

export function bindLogout(buttonId, redirectPath = "./login.html") {
  const button = document.getElementById(buttonId);
  if (!button) return;

  button.addEventListener("click", async () => {
    await Promise.resolve();
    userSession.clear();
    window.location.href = redirectPath;
  });
}
