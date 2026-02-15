import { apiPost } from "./api.js";

const handleAuth = async (endpoint, payload) => {
  const res = await apiPost(endpoint, payload);
  if (res.token) {
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));

    // STRICT REDIRECT BASED ON ROLE
    if (res.user.role === "creator") {
      window.location.href = "dashboard.html";
    } else {
      window.location.href = "eventee-dashboard.html";
    }
  } else {
    alert(res.message || "Authentication failed");
  }
};

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      role: document.getElementById("role").value,
    };
    await handleAuth("/auth/register", payload);
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    };
    await handleAuth("/auth/login", payload);
  });
}
