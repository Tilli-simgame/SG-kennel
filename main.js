// main.js
import { menuMap } from "./kennelStructure.js";
import { router } from "./router.js";
import { createNewWindow } from "./windowManager.js";
import { generateStartMenu } from "./generateNavbarMenu.js";

// Set up the createWindow callback for the router
router.setCreateWindowCallback(createNewWindow);

// Initialize router when the page loads
window.addEventListener("load", () => {
  router.initialize();
});

function initializeMenu() {
  // Generate and insert menu HTML
  const startMenu = document.getElementById("start-menu");
  startMenu.innerHTML = generateStartMenu();

  // Add click handlers for all menu items
  document.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const id = e.currentTarget.id;

      // Handle menu items
      if (menuMap[id]) {
        // Root level items
        createNewWindow(menuMap[id]);
      } else if (id.includes("-")) {
        // Convert ID path to structure path
        const parts = id.split("-");
        const rootMenuItem = parts[0] + "-" + parts[1]; // e.g., "my-computer"
        const rootKey = menuMap[rootMenuItem];

        if (rootKey) {
          const structurePath = [rootKey, ...parts.slice(2)].join(".");
          createNewWindow(structurePath);
        }
      }
    });
  });
}

// Initialize clock functionality
function updateClocks() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const desktopClock = document.getElementById("clock");
  const mobileClock = document.getElementById("mobile-clock");

  if (desktopClock) desktopClock.textContent = timeString;
  if (mobileClock) mobileClock.textContent = timeString;
}

function initializeDropdowns() {
  // Initialize all dropdowns
  document
    .querySelectorAll('[data-bs-toggle="dropdown"]')
    .forEach((dropdownElementList) => {
      new bootstrap.Dropdown(dropdownElementList, {
        autoClose: "outside",
      });
    });
}

// Setup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeMenu();
  initializeDropdowns();
  // Clock update code...
  updateClocks();
  setInterval(updateClocks, 1000);
});
