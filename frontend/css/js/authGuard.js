document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "../pages/login.html";
    return;
  }

  console.log("User authenticated");
});