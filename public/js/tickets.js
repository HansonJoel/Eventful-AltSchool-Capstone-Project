import { apiGet } from "./api.js";

const token = localStorage.getItem("token");
const ticketsContainer = document.getElementById("ticketsContainer");

/* ---------------- LOGOUT LOGIC ---------------- */
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.onclick = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "login.html";
    }
  };
}

/* ---------------- LOAD TICKETS ---------------- */
if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
} else {
  loadTickets();
}

async function loadTickets() {
  try {
    const res = await apiGet("/tickets/me", token);

    const tickets = res.tickets || [];

    ticketsContainer.innerHTML = "";

    if (tickets.length === 0) {
      ticketsContainer.innerHTML = "<p>No tickets found.</p>";
      return;
    }

    tickets.forEach((ticket) => {
      const div = document.createElement("div");
      div.className = "ticket-card";
      div.style.border = "1px solid #ccc";
      div.style.padding = "15px";
      div.style.marginBottom = "15px";
      div.style.borderRadius = "8px";

      div.innerHTML = `
        <h3>${ticket.event?.title || "Event"}</h3>
        <p><strong>Date:</strong> ${new Date(ticket.event?.date).toDateString()}</p>
        <p><strong>Status:</strong> ${ticket.status || "Valid"}</p>
        <div style="margin-top: 10px;">
             <img src="${ticket.qrCode}" width="150" alt="Ticket QR Code" style="border: 1px solid #eee; padding: 5px;"/>
        </div>
        <p><small>Ticket ID: ${ticket._id}</small></p>
      `;

      ticketsContainer.appendChild(div);
    });
  } catch (error) {
    console.error("Failed to load tickets:", error);
    ticketsContainer.innerHTML = "<p>Failed to load tickets.</p>";
  }
}
