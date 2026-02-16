import { apiPost } from "./api.js";

const token = localStorage.getItem("token");

/* ---------------- INITIALIZE PAYMENT ---------------- */
export async function initializePayment(eventId, amount) {
  try {
    if (!token) {
      alert("You must be logged in to make a payment.");
      return;
    }

    // Amount here is just for basic validation. Backend uses DB price.
    const res = await apiPost(
      "/payments/initialize",
      { eventId, amount },
      token,
    );

    if (res.success) {
      // CASE 1: FREE EVENT (Direct Success)
      if (res.free) {
        alert(
          "Registration Successful! You have been registered for this free event.",
        );
        window.location.href = "eventee-dashboard.html"; // Go to user dashboard to see ticket
        return;
      }

      // CASE 2: PAID EVENT (Redirect to Paystack)
      if (res.transaction?.authorization_url) {
        const url = new URL(res.transaction.authorization_url);
        url.searchParams.set("eventId", eventId);
        window.location.href = url.toString();
      } else {
        alert("Failed to initialize payment. Try again.");
      }
    } else {
      alert(res.message || "Failed to initialize payment.");
    }
  } catch (error) {
    console.error("Payment init error:", error);
    alert("Something went wrong during payment initialization.");
  }
}

/* ---------------- VERIFY PAYMENT (No changes needed) ---------------- */
export async function verifyPayment(reference, eventId) {
  try {
    const res = await apiPost(
      "/payments/verify",
      { reference, eventId },
      token,
    );

    const statusText = document.getElementById("status");
    const actions = document.getElementById("actions");

    if (res.success) {
      const { ticket, verification } = res.result;

      statusText.innerHTML = `
        Payment Verified!<br>
        Ticket ID: ${ticket._id}<br>
        Event: ${ticket.ticketCode}<br>
        Amount Paid: ₦${verification.amount / 100}<br>
        Payment Reference: ${verification.reference}
      `;

      statusText.style.color = "green";
      actions.style.display = "block";
    } else {
      statusText.textContent = "Payment verification failed.";
      statusText.style.color = "red";
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    const statusText = document.getElementById("status");
    statusText.textContent = "Error verifying payment. Please contact support.";
    statusText.style.color = "red";
  }
}

/* ---------------- HANDLE PAYSTACK CALLBACK ---------------- */
export function handlePaystackCallback() {
  const params = new URLSearchParams(window.location.search);
  const reference = params.get("reference");
  const eventId = params.get("eventId");

  if (reference && eventId) {
    verifyPayment(reference, eventId);
  }
}

/* ---------------- RUN ON PAYMENT SUCCESS PAGE ---------------- */
document.addEventListener("DOMContentLoaded", handlePaystackCallback);
