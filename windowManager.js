// windowManager.js
import { kennelStructure, menuMap } from "./kennelStructure.js";
import { router } from "./router.js";

// Helper function to generate folder view HTML
export function generateFolderView(items) {
  return `
    <div class="folder-view">
      ${Object.entries(items)
        .map(
          ([key, item]) => `
        <div class="folder-item" data-key="${key}" data-type="${item.type}">
          <span class="folder-icon">${item.icon}</span>
          ${item.title}
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

export class WindowManager {
  constructor(windowId, key, fullPath = null) {
    this.windowId = windowId;

    // Handle menu mapping
    const mappedKey = key.startsWith("my-") ? menuMap[key] : key;
    this.currentPath = fullPath || mappedKey;

    // Register window with router
    router.registerWindow(this.currentPath, this);

    // Update URL if this is a new window
    router.updateUrl(this.currentPath);

    // Get item data from structure
    this.itemData = this.getItemFromPath(this.currentPath);

    // Check if itemData exists
    if (!this.itemData) {
      console.error("Invalid path:", this.currentPath);
      this.itemData = {
        title: "Invalid Location",
        type: "folder",
        icon: "📁",
        children: {},
      };
    }

    // Create window with content
    this.createWindow(this.itemData.title, this.generateContent());

    // Initialize window properties
    this.initializeWindow();
  }

  initializeWindow() {
    this.window = document.getElementById(this.windowId);
    this.header = document.getElementById(`${this.windowId}-header`);

    // Initialize window state
    this.isDragging = false;
    this.isMaximized = false;
    this.isMinimized = false;

    // Store original dimensions and position
    this.originalDimensions = {
      width: "400px",
      height: "auto",
      top: "32px",
      left: "32px",
      transform: "none",
    };

    // Store position while dragging
    this.currentX = 0;
    this.currentY = 0;
    this.initialX = 0;
    this.initialY = 0;
    this.xOffset = 0;
    this.yOffset = 0;

    this.setupWindow();
    this.createTaskbarButton(this.itemData.title);
  }

  getItemFromPath(path) {
    if (!path) return null;

    // Handle root level path
    if (!path.includes(".")) {
      return kennelStructure[path] || null;
    }

    // Split the path into segments and filter out empty segments
    const segments = path.split(".").filter((seg) => seg !== "");
    let current = kennelStructure;

    try {
      // Handle first segment (root level)
      current = current[segments[0]];
      if (!current) return null;

      // Handle remaining segments
      for (let i = 1; i < segments.length; i++) {
        if (segments[i] === "children") continue;

        if (!current.children || !current.children[segments[i]]) {
          return null;
        }
        current = current.children[segments[i]];
      }

      return current;
    } catch (error) {
      console.error("Error traversing path:", path, error);
      return null;
    }
  }

  generatePathFromStructure() {
    if (!this.currentPath) return "";

    // Split the path and filter out 'children'
    const segments = this.currentPath
      .split(".")
      .filter((seg) => seg !== "children");
    const pathParts = [];
    let currentPath = "";

    // Build path parts with accumulating paths
    for (let i = 0; i < segments.length; i++) {
      currentPath = currentPath ? `${currentPath}.${segments[i]}` : segments[i];
      const currentItem = this.getItemFromPath(currentPath);

      if (currentItem) {
        pathParts.push({
          key: currentPath,
          title: currentItem.title,
          icon: currentItem.icon,
        });
      }
    }

    return this.generatePathHTML(pathParts);
  }

  generatePathHTML(pathParts) {
    return pathParts
      .map(
        (part, index) => `
      <span class="path-part" data-key="${part.key}">
        <span class="path-icon">${part.icon}</span>
        <span class="path-text">${part.title}</span>
        ${
          index < pathParts.length - 1
            ? '<span class="path-separator">></span>'
            : ""
        }
      </span>
    `
      )
      .join("");
  }

  createWindow(title, content) {
    const desktop = document.querySelector(".desktop");
    const windowHTML = `
      <div class="card custom-card" id="${
        this.windowId
      }" data-window-state="normal">
        <div class="card-header d-flex justify-content-between align-items-center" id="${
          this.windowId
        }-header">
          <span>${title}</span>
          <div class="title-controls">
            <button class="btn btn-sm window-control" data-action="minimize" title="Minimize">-</button>
            <button class="btn btn-sm window-control" data-action="maximize" title="Maximize">□</button>
            <button class="btn btn-sm window-control" data-action="close" title="Close">×</button>
          </div>
        </div>
        <div class="address-bar d-flex align-items-center">
          <span class="address-label">Address</span>
          <div class="address-content">
            ${this.generatePathFromStructure()}
          </div>
        </div>
        <div class="card-body">
          ${content}
        </div>
      </div>
    `;
    desktop.insertAdjacentHTML("beforeend", windowHTML);
  }

  setupWindow() {
    // Set initial position and dimensions
    Object.assign(this.window.style, {
      position: "absolute",
      ...this.originalDimensions,
    });

    // Get viewport dimensions
    const viewport = document.querySelector(".viewport-container");
    const viewportRect = viewport.getBoundingClientRect();
    const windowWidth = this.window.offsetWidth || 400;
    const windowHeight = this.window.offsetHeight || 300;

    // Calculate center position
    const centerX = (viewportRect.width - windowWidth) / 2;
    const centerY = (viewportRect.height - windowHeight) / 2;

    // Add slight offset for cascade effect
    const offset = 20 * (document.querySelectorAll(".custom-card").length - 1);

    // Set position
    this.window.style.left = `${Math.max(0, centerX + offset)}px`;
    this.window.style.top = `${Math.max(30, centerY + offset)}px`;

    // Add window event listeners
    this.window.addEventListener("mousedown", (e) => this.dragStart(e));
    document.addEventListener("mousemove", (e) => this.drag(e));
    document.addEventListener("mouseup", () => this.dragEnd());
    this.header.addEventListener("dblclick", () => this.toggleMaximize());

    // Setup control buttons
    this.window.querySelectorAll(".window-control").forEach((button) => {
      button.addEventListener("click", (e) => {
        const action = e.target.dataset.action;
        if (action === "minimize") this.minimize();
        if (action === "maximize") this.toggleMaximize();
        if (action === "close") this.close();
      });
    });

    // Focus handling
    this.window.addEventListener("mousedown", () => this.focus());

    // Setup folder items click handlers
    this.setupContentListeners();

    // Setup address bar click handlers
    this.setupAddressBarListeners();
  }

  setupAddressBarListeners() {
    this.window.querySelectorAll(".path-part").forEach((part) => {
      part.addEventListener("click", () => {
        const pathKey = part.dataset.key;
        if (pathKey) {
          this.navigateToPath(pathKey);
        }
      });
    });
  }

  setupContentListeners() {
    this.window.querySelectorAll(".folder-item").forEach((item) => {
      // Double click handler for navigation
      item.addEventListener("dblclick", () => {
        const itemKey = item.dataset.key;
        const itemType = item.dataset.type;

        if (
          itemType === "folder" ||
          itemType === "drive" ||
          itemType === "root"
        ) {
          this.navigateToContent(itemKey);
        } else {
          this.displayFileContent(itemKey);
        }
      });

      // Click handler for selection
      item.addEventListener("click", () => {
        this.window
          .querySelectorAll(".folder-item")
          .forEach((i) => i.classList.remove("selected"));
        item.classList.add("selected");
      });
    });
  }

  navigateToContent(itemKey) {
    let newPath;
    if (!this.currentPath) {
      newPath = itemKey;
    } else {
      const cleanPath = this.currentPath.split(".children.").join(".");
      newPath = `${cleanPath}.children.${itemKey}`;
    }

    const newContent = this.getItemFromPath(newPath);

    if (newContent) {
      // Update current path and router
      this.currentPath = newPath;
      router.updateUrl(newPath);

      // Update window content
      this.itemData = newContent;
      const titleElement = this.header.querySelector("span");
      titleElement.textContent = newContent.title;
      const cardBody = this.window.querySelector(".card-body");
      cardBody.innerHTML = this.generateContent(newContent);
      const addressContent = this.window.querySelector(".address-content");
      addressContent.innerHTML = this.generatePathFromStructure();

      // Reattach event listeners
      this.setupContentListeners();
      this.setupAddressBarListeners();
    }
  }

  navigateToPath(pathKey) {
    const content = this.getItemFromPath(pathKey);
    if (content) {
      // Update current path and router
      this.currentPath = pathKey;
      router.updateUrl(pathKey);

      // Update window content
      this.itemData = content;
      const titleElement = this.header.querySelector("span");
      titleElement.textContent = content.title;
      const cardBody = this.window.querySelector(".card-body");
      cardBody.innerHTML = this.generateContent(content);
      const addressContent = this.window.querySelector(".address-content");
      addressContent.innerHTML = this.generatePathFromStructure();

      // Reattach event listeners
      this.setupContentListeners();
      this.setupAddressBarListeners();
    }
  }

  displayFileContent(itemKey) {
    let filePath;
    if (!this.currentPath) {
      filePath = itemKey;
    } else {
      const cleanPath = this.currentPath.split(".children.").join(".");
      filePath = `${cleanPath}.children.${itemKey}`;
    }

    const currentItem = this.getItemFromPath(filePath);

    if (currentItem) {
      const fileContent = `
        <div class="file-content p-3">
          <h4>Content for: ${currentItem.title}</h4>
          <p>This is the content of the file. You can customize this based on the file type and your needs.</p>
        </div>
      `;

      const cardBody = this.window.querySelector(".card-body");
      cardBody.innerHTML = fileContent;
    }
  }

  generateContent(item = this.itemData) {
    if (item.children) {
      return generateFolderView(item.children);
    }
    return `<div class="file-view">Content for ${item.title}</div>`;
  }

  createTaskbarButton(title) {
    const taskbarWindows = document.getElementById("taskbar-windows");
    const button = document.createElement("button");
    button.className = "window-button";
    button.id = `taskbar-${this.windowId}`;
    button.innerHTML = `
      <span class="window-icon">📝</span>
      ${title}
    `;
    button.addEventListener("click", () => this.toggleMinimize());
    taskbarWindows.appendChild(button);
    this.taskbarButton = button;
  }

  dragStart(e) {
    if (
      e.target.classList.contains("window-control") ||
      e.target.classList.contains("btn-secondary") ||
      this.isMaximized
    ) {
      return;
    }

    this.isDragging = true;
    const scale = this.getScaleFactor();
    const scaledClientX = e.clientX / scale;
    const scaledClientY = e.clientY / scale;

    this.initialX = scaledClientX - this.xOffset;
    this.initialY = scaledClientY - this.yOffset;

    this.focus();
    this.window.style.cursor = "grabbing";
  }

  drag(e) {
    if (!this.isDragging) return;

    e.preventDefault();
    const scale = this.getScaleFactor();
    const scaledClientX = e.clientX / scale;
    const scaledClientY = e.clientY / scale;

    this.currentX = scaledClientX - this.initialX;
    this.currentY = scaledClientY - this.initialY;

    // Calculate boundaries
    const taskbarHeight = 30;
    const minX = 0;
    const maxX = 1024 - this.window.offsetWidth;
    const minY = taskbarHeight;
    const maxY = 800 - this.window.offsetHeight;

    // Screen edge snapping
    const snapDistance = 20;
    let targetX = this.currentX;
    let targetY = this.currentY;

    // Snap to edges
    if (Math.abs(targetX - minX) < snapDistance) targetX = minX;
    if (Math.abs(targetX - maxX) < snapDistance) targetX = maxX;
    if (Math.abs(targetY - minY) < snapDistance) targetY = minY;
    if (Math.abs(targetY - maxY) < snapDistance) targetY = maxY;

    // Constrain to boundaries
    targetX = Math.max(minX, Math.min(maxX, targetX));
    targetY = Math.max(minY, Math.min(maxY, targetY));

    this.xOffset = targetX;
    this.yOffset = targetY;

    this.window.style.transform = `translate(${targetX}px, ${targetY}px)`;
  }

  dragEnd() {
    this.isDragging = false;
    this.window.style.cursor = "default";
  }

  minimize() {
    this.isMinimized = true;
    this.window.style.display = "none";
    this.taskbarButton.classList.add("active");
  }

  maximize() {
    this.isMaximized = true;
    this.window.dataset.windowState = "maximized";

    this.originalDimensions = {
      width: this.window.style.width || "400px",
      height: this.window.style.height || "auto",
      top: this.window.style.top || "32px",
      left: this.window.style.left || "32px",
      transform: this.window.style.transform || "none",
    };

    const taskbarHeight = 30;
    Object.assign(this.window.style, {
      top: `${taskbarHeight}px`,
      left: "0",
      width: "1024px",
      height: `${800 - taskbarHeight}px`,
      transform: "none",
      borderRadius: "0",
      margin: "0",
    });
  }

  restore() {
    if (this.isMinimized) {
      this.isMinimized = false;
      this.window.style.display = "flex";
      this.taskbarButton.classList.remove("active");
    }

    if (this.isMaximized) {
      this.isMaximized = false;
      this.window.dataset.windowState = "normal";

      Object.assign(this.window.style, {
        width: this.originalDimensions.width,
        height: this.originalDimensions.height,
        top: this.originalDimensions.top,
        left: this.originalDimensions.left,
        transform: this.originalDimensions.transform,
        borderRadius: "3px",
        margin: "0",
      });
    }

    this.focus();
  }

  toggleMinimize() {
    if (this.isMinimized) {
      this.restore();
    } else {
      this.minimize();
    }
  }

  toggleMaximize() {
    if (this.isMaximized) {
      this.restore();
    } else {
      this.maximize();
    }
  }

  focus() {
    document.querySelectorAll(".custom-card").forEach((card) => {
      card.style.zIndex = "1";
      const taskbarButton = document.getElementById(`taskbar-${card.id}`);
      if (taskbarButton) {
        taskbarButton.classList.remove("active");
      }
    });
    this.window.style.zIndex = "2";
    this.taskbarButton.classList.add("active");
  }

  close() {
    // Unregister window from router
    router.unregisterWindow(this.currentPath);

    // Remove DOM elements
    this.window.remove();
    this.taskbarButton.remove();

    // Get all remaining windows
    const remainingWindows = router.getWindows();

    if (remainingWindows.size === 0) {
      // If this was the last window, clear the hash completely
      history.pushState(
        "",
        document.title,
        window.location.pathname + window.location.search
      );
    } else {
      // If there are other windows, update URL to reflect the most recently focused one
      const focusedWindow = Array.from(
        document.querySelectorAll(".custom-card")
      ).find((card) => card.style.zIndex === "2");

      if (focusedWindow) {
        const windowInstance = Array.from(remainingWindows.values()).find(
          (w) => w.windowId === focusedWindow.id
        );

        if (windowInstance) {
          router.updateUrl(windowInstance.currentPath);
        }
      }
    }
  }

  getScaleFactor() {
    const viewport = document.querySelector(".viewport-container");
    const transform = viewport.style.transform;
    const scale = transform
      ? parseFloat(transform.match(/scale\((.*?)\)/)?.[1] || 1)
      : 1;
    return scale;
  }

  // Helper method to get parent path
  getParentPath() {
    const pathSegments = this.currentPath.split(".");
    // Remove 'children' from the path if present
    const cleanedSegments = pathSegments.filter(
      (segment) => segment !== "children"
    );
    return cleanedSegments.slice(0, -1).join(".");
  }

  // Navigate up one level
  navigateUp() {
    const parentPath = this.getParentPath();
    if (parentPath) {
      this.navigateToPath(parentPath);
    }
  }

  // Refresh current view
  refresh() {
    this.navigateToPath(this.currentPath);
  }

  // Check if path exists
  pathExists(path) {
    return !!this.getItemFromPath(path);
  }

  // Get current directory contents
  getCurrentContents() {
    return this.itemData.children || {};
  }

  // Get selected items
  getSelectedItems() {
    const selectedElements = this.window.querySelectorAll(
      ".folder-item.selected"
    );
    return Array.from(selectedElements).map((element) => ({
      key: element.dataset.key,
      type: element.dataset.type,
    }));
  }

  // Update window title
  updateTitle(newTitle) {
    const titleElement = this.header.querySelector("span");
    if (titleElement) {
      titleElement.textContent = newTitle;
    }
  }

  // Check if window is focused
  isFocused() {
    return this.window.style.zIndex === "2";
  }

  // Check if path is a file
  isFile(path) {
    const item = this.getItemFromPath(path);
    return item && item.type === "file";
  }

  // Check if path is a folder
  isFolder(path) {
    const item = this.getItemFromPath(path);
    return (
      item &&
      (item.type === "folder" || item.type === "drive" || item.type === "root")
    );
  }
}

let windowCounter = 1;

export function createNewWindow(path) {
  const windowId = `window-${windowCounter++}`;

  // If window already exists for this path, focus it instead
  const existingWindow = router.getWindows().get(path);
  if (existingWindow) {
    existingWindow.focus();
    return existingWindow;
  }

  // Handle menu prefix paths
  if (path.startsWith("my-")) {
    const mappedKey = menuMap[path];
    if (mappedKey) {
      return new WindowManager(windowId, path);
    }
  }

  return new WindowManager(windowId, path);
}

// Usage examples:
// const window = createNewWindow('ourKennel');
// window.navigateToContent('aboutUs');
// window.maximize();
// window.minimize();
// window.close();
