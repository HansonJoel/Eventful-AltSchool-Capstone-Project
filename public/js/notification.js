import { apiGet } from "./api.js";

const notificationsList = document.getElementById("notificationsList");
const token = localStorage.getItem("token");

// Fetch notifications for the user
async function loadNotifications() {
  try {
    const res = await apiGet("/notifications/me", token);

    if (res.success) {
      notificationsList.innerHTML = "";
      res.result.forEach((note) => {
        const li = document.createElement("li");
        li.textContent = `${note.message} (${new Date(note.createdAt).toLocaleString()})`;
        notificationsList.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error loading notifications:", error);
  }
}

loadNotifications();

// Poll for new notifications every 30 seconds
setInterval(loadNotifications, 30000);
