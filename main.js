// main.js
import { menuMap } from "./kennelStructure.js";
import { router } from "./router.js";
import { createNewWindow } from "./windowManager.js";
import { generateStartMenu } from "./generateNavbarMenu.js";
import { createShortcut } from './desktopShortcut.js';
import { StickyNote, STICKY_COLORS } from "./stickyNotes.js";

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
  document.querySelectorAll(".menu-link").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const id = e.currentTarget.id;
      if (menuMap[id]) {
        createNewWindow(menuMap[id]);
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

function initializeDesktop() {
  const desktop = document.querySelector('.desktop');

  // Create some shortcuts
  const shortcuts = [
    {
      path: 'ourDogs',
      title: 'Our Dogs',
      icon: '🐕'
    },
    {
      path: 'contactInfo',
      title: 'Contact & Info',
      icon: '⚙️'
    }
  ];

  // Add shortcuts to desktop
  shortcuts.forEach((shortcut, index) => {
    const shortcutElement = createShortcut(
      shortcut.path,
      shortcut.title,
      shortcut.icon
    );
    
    // Position shortcuts in a column
    shortcutElement.style.position = 'absolute';
    shortcutElement.style.top = `${20 + (index * 100)}px`;
    shortcutElement.style.left = '20px';
    
    desktop.appendChild(shortcutElement);
  });
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

new StickyNote(
  'Welcome visitor!',
  'Nice to have you here :).',
  { x: 800, y: 100 }, 'yellow'
);

// Setup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeMenu();
  initializeDropdowns();
  // Clock update code...
  updateClocks();
  initializeDesktop();
  setInterval(updateClocks, 1000);
});
