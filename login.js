const LOGIN_API = "http://localhost:5000/api/auth/login";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const roleSelect = document.getElementById("role");
  const errorEl = document.getElementById("errorMsg");

  if (!loginForm) return;

  function showError(msg) {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.remove("d-none");
    } else {
      alert(msg);
    }
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim(); // Trim added
    const role = roleSelect.value.trim().toLowerCase();

    console.log("📤 Sending login payload:", { email, password: `"${password}"`, role });

    if (!email || !password || !role) {
      return showError("Please fill all fields");
    }

    if (!["student", "admin"].includes(role)) {
      return showError("Only student and admin roles are supported");
    }

    try {
      const res = await fetch(LOGIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      console.log("📥 Received response:", data);

      if (!res.ok) throw new Error(data.error || "Login failed");

      const user = data.user;
      const token = data.token;

      if (!user || !token || !user.role) {
        return showError("Invalid login response");
      }

      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", user.role);

      const roleRoutes = {
        student: {
          idKey: "studentMongoId",
          nameKey: "studentName",
          nameValue: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          redirect: "student-dashboard.html"
        },
        admin: {
          idKey: "adminMongoId",
          nameKey: "adminName",
          nameValue: user.username || "Admin",
          redirect: "admin.html"
        }
      };

      const config = roleRoutes[user.role];
      if (!config) return showError("Unknown role");

      localStorage.setItem(config.idKey, user._id || user.id);
      localStorage.setItem(config.nameKey, config.nameValue);

      console.log("🗂️ Stored in localStorage:", {
        authToken: localStorage.getItem("authToken"),
        userRole: localStorage.getItem("userRole"),
        [config.idKey]: localStorage.getItem(config.idKey),
        [config.nameKey]: localStorage.getItem(config.nameKey)
      });

      window.location.href = config.redirect;

    } catch (err) {
      console.error("❌ Login error:", err);
      showError(err.message);
    }
  });
});