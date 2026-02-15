import { apiGet } from "./api.js";

const container = document.getElementById("eventsContainer");
const token = localStorage.getItem("token");
let currentPage = 1;
let currentFilter = "upcoming"; // upcoming, applied, expired

// Init
const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "eventee") window.location.href = "login.html";

document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "login.html";
};

// Filter Event Listeners
document.getElementById("btnUpcoming").onclick = () => setFilter("upcoming");
document.getElementById("btnApplied").onclick = () => setFilter("applied");
document.getElementById("btnExpired").onclick = () => setFilter("expired");

// Pagination Listeners
document.getElementById("prevBtn").onclick = () => changePage(-1);
document.getElementById("nextBtn").onclick = () => changePage(1);

function setFilter(filter) {
  currentFilter = filter;
  currentPage = 1;
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  const btnId =
    filter === "upcoming"
      ? "btnUpcoming"
      : filter === "applied"
        ? "btnApplied"
        : "btnExpired";
  document.getElementById(btnId).classList.add("active");
  loadData();
}

async function changePage(dir) {
  currentPage += dir;
  if (currentPage < 1) currentPage = 1;
  loadData();
}

async function loadData() {
  container.innerHTML = "Loading...";
  let endpoint = "";

  if (currentFilter === "upcoming") {
    // Fetch all upcoming events (paginated)
    endpoint = `/events?page=${currentPage}&limit=9`;
  } else {
    // For applied/expired, i fetched applied events and filter client side for now (or create specific endpoints)
    endpoint = "/events/applied";
  }

  try {
    const res = await apiGet(endpoint, token);
    let events = res.events || [];

    // Client-side filtering for specific logic if backend is generic
    const now = new Date();
    if (currentFilter === "upcoming") {
      events = events.filter((e) => new Date(e.date) >= now);
    } else if (currentFilter === "applied") {
      // Backend 'applied' endpoint returns all applied. Filter for upcoming applied.
      events = events.filter((e) => new Date(e.date) >= now);
    } else if (currentFilter === "expired") {
      // Backend 'applied' endpoint returns all applied. Filter for expired applied.
      events = events.filter((e) => new Date(e.date) < now);
    }

    renderEvents(events);

    // Handle pagination display
    const totalPages = res.totalPages || 1;
    document.getElementById("pageInfo").innerText =
      `Page ${currentPage} of ${totalPages}`;
    document.getElementById("nextBtn").disabled = currentPage >= totalPages;
    document.getElementById("prevBtn").disabled = currentPage <= 1;
  } catch (e) {
    console.error(e);
    container.innerHTML = "Error loading events.";
  }
}

function renderEvents(events) {
  container.innerHTML = "";
  if (events.length === 0) {
    container.innerHTML = "<p>No events found.</p>";
    return;
  }

  events.forEach((e) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
            <h3>${e.title}</h3>
            <p class="date">${new Date(e.date).toDateString()} @ ${e.time}</p>
            <p>📍 ${e.location}</p>
            <p class="price">₦${e.price}</p>
            <a href="event-details.html?id=${e._id}" class="btn-link">View Details</a>
        `;
    container.appendChild(div);
  });
}

// Initial Load
loadData();
