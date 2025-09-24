const API_BASE = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("appointmentsTable");
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");

  if (!token || role !== "admin") {
    alert("Access denied.");
    window.location.href = "login.html";
    return;
  }

  // ======================
  // Fetch Appointments
  // ======================
  async function fetchAppointments() {
    try {
      const res = await fetch(`${API_BASE}/api/appointments/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        console.error(`❌ Server responded with ${res.status}`);
        return [];
      }

      const data = await res.json();
      return data.success ? data.data : [];
    } catch (err) {
      console.error("❌ Fetch appointments error:", err);
      return [];
    }
  }

  // ======================
  // Render Table
  // ======================
  async function loadAppointments() {
    const appointments = await fetchAppointments();

    if (!appointments.length) {
      tableBody.innerHTML = "<tr><td colspan='7'>No appointments found.</td></tr>";
      return;
    }

    tableBody.innerHTML = "";

    appointments.forEach(app => {
      const {
        _id,
        name,
        studentId,
        reason,
        date,
        time,
        status
      } = app;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${name || "N/A"}</td>
        <td>${studentId || "—"}</td>
        <td>${date ? new Date(date).toLocaleDateString() : "N/A"}</td>
        <td>${reason || "—"}</td>
        <td>${time || "—"}</td>
        <td>${status}</td>
        <div class="action-icons">
        <span title="Delete" onclick="deleteAppointment('${_id}')">🗑️</span>
        <span title="Approve" onclick="updateStatus('${_id}', 'Approved')">✔️</span>
        <span title="Reject" onclick="updateStatus('${_id}', 'Rejected')">❌</span>
       
      `;
      tableBody.appendChild(tr);
    });
  }

  // ======================
  // Delete Appointment
  // ======================
  window.deleteAppointment = async (id) => {
    if (!confirm("Delete this appointment?")) return;

    try {
      await fetch(`${API_BASE}/api/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      loadAppointments();
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  // ======================
  // Update Status
  // ======================
  window.updateStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE}/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      loadAppointments();
    } catch (err) {
      console.error("❌ Status update error:", err);
    }
  };

  // ======================
  // Initial Load
  // ======================
  loadAppointments();
});
