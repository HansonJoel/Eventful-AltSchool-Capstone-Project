import { apiPost } from "./api.js";

const params = new URLSearchParams(window.location.search);
const reference = params.get("reference");
const eventId = params.get("eventId");
const token = localStorage.getItem("token");

// Main containers
const loadingDiv = document.getElementById("loading");
const successDiv = document.getElementById("successContent");
const errorDiv = document.getElementById("errorContent");

// Select the specific text elements
const statusText = document.getElementById("status");
const errorMessage = document.getElementById("errorMessage");

async function init() {
  if (!token) {
    showError("You are not logged in.");
    return;
  }
  if (!reference || !eventId) {
    showError("Invalid payment reference or event ID.");
    return;
  }
  await verifyPayment(reference, eventId);
}

async function verifyPayment(reference, eventId) {
  try {
    const res = await apiPost(
      "/payments/verify",
      { reference, eventId },
      token,
    );

    if (res.success) {
      const { ticket, verification } = res.result;
      const eventName = ticket.event?.title || "Event Ticket";
      const amountPaid = verification.amount
        ? (verification.amount / 100).toLocaleString()
        : "0.00";

      // Inject the success details
      statusText.innerHTML = `
        <h2 style="color: green; margin-top:0;">Payment Verified! ✅</h2>
        <div style="margin: 20px 0;">
          <img src="${ticket.qrCode}" alt="Ticket QR Code" style="width: 200px; height: 200px; border: 1px solid #ddd; padding: 10px; border-radius: 8px;">
          <p style="margin-top: 10px;"><strong>Scan this QR code at the venue for entry</strong></p>
        </div>
        <div style="text-align: left; display: inline-block; background: #f9f9f9; padding: 15px; border-radius: 8px;">
          <p><strong>Event:</strong> ${eventName}</p>
          <p><strong>Ticket Code:</strong> ${ticket.ticketCode}</p>
          <p><strong>Amount Paid:</strong> ₦${amountPaid}</p>
          <p><strong>Reference:</strong> ${verification.reference}</p>
        </div>
        <p style="font-size: 0.9rem; color: gray; margin-top: 15px;">A confirmation email with your ticket has been sent.</p>
      `;

      // TOGGLE VISIBILITY
      loadingDiv.style.display = "none";
      successDiv.style.display = "block";
      errorDiv.style.display = "none";
    } else {
      showError(`Verification failed: ${res.message || "Unknown error"}`);
    }
  } catch (error) {
    showError(`Error verifying payment: ${error.message}`);
  }
}

function showError(message) {
  loadingDiv.style.display = "none";
  successDiv.style.display = "none";
  errorDiv.style.display = "block";
  errorMessage.textContent = message;
}

init();
