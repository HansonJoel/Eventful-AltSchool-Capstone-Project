import { apiGet, apiPost } from "./api.js";
import { initializePayment } from "./payment.js";

/* ---------------- GLOBAL VARIABLES ---------------- */
let user = null;
try {
  const userStr = localStorage.getItem("user");
  if (userStr && userStr !== "undefined") {
    user = JSON.parse(userStr);
  }
} catch (e) {
  console.error("User parsing error", e);
}

/* ---------------- LOGOUT LOGIC ---------------- */
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.onclick = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      window.location.href = "login.html";
    }
  };
}

/* ---------------- ALL EVENTS PAGE ---------------- */
const eventsContainer = document.getElementById("eventsContainer");
const createEventBtn = document.getElementById("createEventBtn");

if (eventsContainer) {
  loadEvents();
}

if (user?.role === "creator" && createEventBtn) {
  createEventBtn.style.display = "block";
  createEventBtn.onclick = () => {
    window.location.href = "create-event.html";
  };
}

async function loadEvents() {
  try {
    const token = localStorage.getItem("token");
    const res = await apiGet("/events", token);
    const events = res.events || [];
    eventsContainer.innerHTML = "";

    if (events.length === 0) {
      eventsContainer.innerHTML = "<p>No events found.</p>";
      return;
    }

    events.forEach((event) => {
      const div = document.createElement("div");
      div.className = "event-card";
      div.innerHTML = `
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <p>📍 ${event.location}</p>
        <p>₦${event.price}</p>
        <a href="event-details.html?id=${event._id}">View Details</a>
      `;
      eventsContainer.appendChild(div);
    });
  } catch (error) {
    console.error("Failed to load events:", error);
    eventsContainer.innerHTML = "<p>Failed to load events.</p>";
  }
}

/* ---------------- EVENT DETAILS PAGE ---------------- */
const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");
const applyBtn = document.getElementById("applyBtn");
const buyBtn = document.getElementById("buyTicketBtn");
const shareBtn = document.getElementById("shareBtn");

if (eventId) {
  loadEventDetails(eventId);
}

async function loadEventDetails(id) {
  try {
    const token = localStorage.getItem("token");
    const res = await apiGet(`/events/${id}`, token);

    // Safety check: Ensure event exists
    if (!res || !res.event) {
      document.getElementById("title").textContent = "Event not found";
      return;
    }

    const event = res.event;

    // Activate Share Button
    if (shareBtn) {
      shareBtn.onclick = () => shareEvent(id);
    }

    // Populate UI
    document.getElementById("title").textContent = event.title || "No Title";
    document.getElementById("description").textContent =
      event.description || "No description";
    document.getElementById("location").textContent =
      event.location || "Online";
    document.getElementById("date").textContent = event.date
      ? new Date(event.date).toDateString()
      : "TBD";
    document.getElementById("price").textContent =
      event.price !== undefined ? event.price : "0";

    // Safety check: Ensure attendees array exists
    const attendees = Array.isArray(event.attendees) ? event.attendees : [];

    const userId = user?.id || user?._id;

    // Check if user is already attending
    const isAttending =
      userId &&
      attendees.some(
        (attendee) =>
          (typeof attendee === "string" && attendee === userId) ||
          (typeof attendee === "object" && attendee._id === userId),
      );

    const statusMsg = document.getElementById("statusMessage");

    if (isAttending) {
      // CASE 1: Already Attending
      if (statusMsg) {
        statusMsg.textContent = "✅ You are attending this event!";
        statusMsg.style.display = "block";
      }
      if (applyBtn) applyBtn.style.display = "none";
      if (buyBtn) buyBtn.style.display = "none";
    } else {
      // CASE 2: Not Attending Yet
      if (event.price > 0) {
        // PAID Event
        if (buyBtn) buyBtn.style.display = "inline-block";
        if (applyBtn) applyBtn.style.display = "none";
      } else {
        // FREE Event
        if (applyBtn) applyBtn.style.display = "inline-block";
        if (buyBtn) buyBtn.style.display = "none";
      }
    }

    // Attach "Attend" listener for free events
    if (applyBtn) applyBtn.onclick = () => applyForEvent(id);
  } catch (error) {
    console.error("Failed to load event details:", error);
    document.getElementById("title").textContent = "Error loading event";
  }
}

/* ---------------- APPLY FOR EVENT (FREE) ---------------- */
async function applyForEvent(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  const res = await apiPost(`/events/${id}/apply`, {}, token);

  if (res.success) {
    alert("Successfully applied for event!");
    loadEventDetails(id);
  } else {
    alert(res?.message || "Already applied");
  }
}

/* ---------------- SHARE EVENT ---------------- */
function shareEvent(id) {
  const link = `${window.location.origin}/event-details.html?id=${id}`;

  navigator.clipboard
    .writeText(link)
    .then(() => {
      const container = document.getElementById("shareContainer");
      const textLink = document.getElementById("shareLinkText");

      if (container && textLink) {
        textLink.textContent = link;
        textLink.href = link;
        container.style.display = "block";
      }
    })
    .catch((err) => {
      console.error("Clipboard failed", err);
      prompt("Copy this link:", link);
    });
}
