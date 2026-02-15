import { apiPost } from "./api.js";

const token = localStorage.getItem("token");

/* ---------------- INITIALIZE PAYMENT ---------------- */
export async function initializePayment(eventId, amount) {
  try {
    if (!token) {
      alert("You must be logged in to make a payment.");
      return;
    }

    // Amount in NAIRA (backend converts to kobo)
    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      alert("Invalid payment amount.");
      return;
    }

    const res = await apiPost(
      "/payments/initialize",
      {
        eventId,
        amount: paymentAmount,
      },
      token,
    );

    if (res.success && res.transaction?.authorization_url) {
      // Append eventId so we can verify after redirect
      const url = new URL(res.transaction.authorization_url);
      url.searchParams.set("eventId", eventId);

      window.location.href = url.toString();
    } else {
      alert("Failed to initialize payment. Try again.");
    }
  } catch (error) {
    console.error("Payment init error:", error);
    alert("Something went wrong during payment initialization.");
  }
}

/* ---------------- VERIFY PAYMENT ---------------- */
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
        Event: ${ticket.event.title}<br>
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
