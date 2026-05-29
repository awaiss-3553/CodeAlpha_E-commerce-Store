import { apiFetch, setToken, clearToken, getToken } from "./api.js";
import { renderBadge } from "./cart.js";

export function setupTopbarAuthUI() {
  const loginLink = document.getElementById("loginLink");
  const registerLink = document.getElementById("registerLink");
  const logoutBtn = document.getElementById("logoutBtn");

  const token = getToken();
  if (token) {
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline";
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        clearToken();
        renderBadge();
        location.href = "./index.html";
      };
    }
  } else {
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("msg");
    msg.textContent = "Signing in...";
    try {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const data = await apiFetch("/api/auth/login", { method: "POST", body: { email, password } });
      setToken(data.token);
      msg.textContent = "Login successful. Redirecting...";
      setTimeout(() => (location.href = "./index.html"), 700);
    } catch (err) {
      msg.textContent = err.message;
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("msg");
    msg.textContent = "Creating account...";
    try {
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const data = await apiFetch("/api/auth/register", { method: "POST", body: { name, email, password } });
      setToken(data.token);
      msg.textContent = "Account created. Redirecting...";
      setTimeout(() => (location.href = "./index.html"), 700);
    } catch (err) {
      msg.textContent = err.message;
    }
  });
}
