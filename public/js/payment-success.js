import { apiPost } from "./api.js";

const params = new URLSearchParams(window.location.search);
const reference = params.get("reference"); // From Paystack
const eventId = params.get("eventId"); // From our URL param

const token = localStorage.getItem("token");
const statusText = document.getElementById("status");
const actions = document.getElementById("actions");

async function init() {
  if (!token) {
    statusText.textContent = "You are not logged in.";
    statusText.style.color = "red";
    return;
  }

  if (!reference || !eventId) {
    statusText.textContent = "Invalid payment reference or event ID.";
    statusText.style.color = "red";
    return;
  }

  // Call verification function
  await verifyPayment(reference, eventId);
}

async function verifyPayment(reference, eventId) {
  try {
    statusText.textContent = "Verifying payment with Paystack...";

    const res = await apiPost(
      "/payments/verify",
      { reference, eventId },
      token,
    );

    if (res.success) {
      const { ticket, verification } = res.result;

      statusText.innerHTML = `
        <strong>Payment Verified!</strong><br><br>
        Event: ${ticket.event?.title || "Event"}<br>
        Ticket Code: <strong>${ticket.ticketCode || ticket._id}</strong><br>
        Amount Paid: ₦${(verification.amount / 100).toLocaleString()}<br>
        Ref: ${verification.reference}
      `;
      statusText.style.color = "green";
      actions.style.display = "block";
    } else {
      statusText.textContent = `Verification failed: ${res.message || "Unknown error"}`;
      statusText.style.color = "red";
    }
  } catch (error) {
    console.error("Verification Error:", error);
    statusText.textContent = "Error verifying payment. Please contact support.";
    statusText.style.color = "red";
  }
}

// Start the process
init();
