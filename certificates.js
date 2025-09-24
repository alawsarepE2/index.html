document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("sendCertBtn");

  sendBtn.addEventListener("click", async () => {
    const studentName = document.getElementById("studentNameInput").value.trim();
    const studentEmail = document.getElementById("studentEmailInput").value.trim();
    const reason = document.getElementById("reasonInput").value.trim();

    if (!studentName || !studentEmail || !reason) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        studentName,
        studentEmail,
        reason
      };

      const res = await fetch("http://localhost:5000/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Certificate sent successfully to " + studentEmail);
      } else {
        throw new Error(data.error || "Failed to send certificate");
      }
    } catch (err) {
      console.error("❌ Send error:", err);
      alert("Error sending certificate. Check console for details.");
    }
  });
});
