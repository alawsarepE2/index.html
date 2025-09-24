// =========================
// Handle Login
// =========================
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Login failed");

    // Save token if using JWT
    localStorage.setItem("token", data.token);
    alert(`Welcome, ${data.name || email}`);

    // ✅ Redirect students by default
    window.location.href = "/student-dashboard.html";

  } catch (error) {
    alert(error.message);
  }
});

// =========================
// Handle Registration
// =========================
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const studentId = document.getElementById("studentId").value;
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (password !== confirm) {
    alert("Passwords do not match");
    return;
  }

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, firstName, lastName, email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    alert("Account created successfully!");
    window.location.href = "/login.html";

  } catch (error) {
    alert(error.message);
  }
});

// =========================
// Firebase Auth Redirect
// =========================
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // ✅ If logged-in email is admin
    if (user.email === "adminlucena@gmail.com") {
      window.location.href = "admin.html";
    }
  }
});
