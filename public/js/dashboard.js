import { apiGet } from "./api.js";

const eventsContainer = document.getElementById("eventsContainer");
let myEvents = [];

// Init
const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "creator") {
  window.location.href = "login.html";
} else {
  loadMyEvents();
}

document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "login.html";
};

async function loadMyEvents() {
  try {
    const res = await apiGet(
      "/events/creator/me",
      localStorage.getItem("token"),
    );
    if (res.success) {
      myEvents = res.events;
      filterEvents("upcoming"); // Default view
    }
  } catch (error) {
    console.error(error);
  }
}

// Filters
document.getElementById("filterUpcoming").onclick = (e) => {
  setActive(e.target);
  filterEvents("upcoming");
};
document.getElementById("filterExpired").onclick = (e) => {
  setActive(e.target);
  filterEvents("expired");
};

function setActive(btn) {
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

function filterEvents(type) {
  const now = new Date();
  const filtered = myEvents.filter((e) => {
    const eDate = new Date(e.date);
    return type === "upcoming" ? eDate >= now : eDate < now;
  });
  renderEvents(filtered);
}

function renderEvents(events) {
  eventsContainer.innerHTML = "";
  if (events.length === 0) {
    eventsContainer.innerHTML = "<p>No events found.</p>";
    return;
  }
  events.forEach((e) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${e.title}</h3>
      <p>📅 ${new Date(e.date).toDateString()}</p>
      <p>📍 ${e.location}</p>
      <p>Attendees: ${e.attendees.length}</p>
    `;
    eventsContainer.appendChild(div);
  });
}
