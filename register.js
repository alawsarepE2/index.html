const REGISTER_API = "http://localhost:5000/api/auth/register";

const signupForm = document.getElementById("signupForm");
const signupError = document.getElementById("signupError");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupError.textContent = "";

  const studentId = document.getElementById("studentId").value.trim();
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  if (!studentId || !firstName || !lastName || !contact || !email || !password) {
    signupError.textContent = "All fields are required.";
    return;
  }

  const payload = { studentId, firstName, lastName, contact, email, password, role: "student" };

  try {
    const response = await fetch(REGISTER_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message || "✅ Registration successful!");
      // Save token for auto-login if needed
      localStorage.setItem("authToken", result.token);
      localStorage.setItem("userRole", "student");
      localStorage.setItem("studentId", result.user.studentId);
      window.location.href = "login.html";
    } else {
      signupError.textContent = result.error || "❌ Registration failed.";
    }
  } catch (err) {
    signupError.textContent = "❌ Network error: " + err.message;
  }
});
