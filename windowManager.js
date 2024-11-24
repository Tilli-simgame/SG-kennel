// windowManager.js
import { kennelStructure, menuMap } from "./kennelStructure.js";
import { router } from "./router.js";
import { getFolderWindowHTML, generateFolderView, setupFolderListeners } from "./folderWindow.js";
import { getNotepadWindowHTML, generateNotepadContent, setupNotepadListeners } from "./notepadWindow.js";
import { getProfileWindowHTML, generateProfileContent } from "./profileWindow.js";

export class WindowManager {
  constructor(windowId, key, fullPath = null) {
    this.windowId = windowId;
    
    // Handle menu mapping
    const mappedKey = key.startsWith('my-') ? menuMap[key] : key;
    this.currentPath = fullPath || mappedKey;
    
    // Register window with router
    router.registerWindow(this.currentPath, this);
    
    // Update URL if this is a new window
    router.updateUrl(this.currentPath);
    
    // Get item data from structure
    this.itemData = this.getItemFromPath(this.currentPath);
    
    // Check if itemData exists
    if (!this.itemData) {
      console.error('Invalid path:', this.currentPath);
      this.itemData = {
        title: 'Invalid Location',
        type: 'folder',
        icon: '📁',
        children: {}
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
      width: "600px",
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
    if (!path.includes('.')) {
      return kennelStructure[path] || null;
    }
    
    // Split the path into segments and filter out empty segments
    const segments = path.split('.').filter(seg => seg !== '');
    let current = kennelStructure;
    
    try {
      // Handle first segment (root level)
      current = current[segments[0]];
      if (!current) return null;
      
      // Handle remaining segments
      for (let i = 1; i < segments.length; i++) {
        if (segments[i] === 'children') continue;
        
        if (!current.children || !current.children[segments[i]]) {
          return null;
        }
        current = current.children[segments[i]];
      }
      
      return current;
    } catch (error) {
      console.error('Error traversing path:', path, error);
      return null;
    }
  }

  generatePathFromStructure() {
    if (!this.currentPath) return '';
    
    // Split the path and filter out 'children'
    const segments = this.currentPath.split('.').filter(seg => seg !== 'children');
    const pathParts = [];
    let currentPath = '';
    
    // Build path parts with accumulating paths
    for (let i = 0; i < segments.length; i++) {
      currentPath = currentPath ? `${currentPath}.${segments[i]}` : segments[i];
      const currentItem = this.getItemFromPath(currentPath);
      
      if (currentItem) {
        pathParts.push({
          key: currentPath,
          title: currentItem.title,
          icon: currentItem.icon
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

  // createWindow method
createWindow(title, content) {
  const desktop = document.querySelector(".desktop");
  let windowHTML;

  if (this.itemData.type === "file") {
    if (this.currentPath.includes('packOfPaws')) {
      windowHTML = getProfileWindowHTML(this.windowId, title, content);
    } else {
      windowHTML = getNotepadWindowHTML(this.windowId, title, content);
    }
  } else {
    windowHTML = getFolderWindowHTML(this.windowId, title, this.generatePathFromStructure(), content);
  }

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
    
    // Set initial position through transform instead of left/top
    this.xOffset = Math.max(0, centerX + offset);
    this.yOffset = Math.max(30, centerY + offset);
    this.window.style.transform = `translate(${this.xOffset}px, ${this.yOffset}px)`;

    // Rest of the event listeners setup
    this.window.addEventListener("mousedown", (e) => this.dragStart(e));
    document.addEventListener("mousemove", (e) => this.drag(e));
    document.addEventListener("mouseup", () => this.dragEnd());
    this.header.addEventListener("dblclick", () => this.toggleMaximize());

    // Setup control buttons
    this.window.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener("click", (e) => {
        const action = e.target.dataset.action;
        if (action === "minimize") this.minimize();
        if (action === "maximize") this.toggleMaximize();
        if (action === "close") this.close();
      });
    });

    // Focus handling
    this.window.addEventListener("mousedown", () => this.focus());

    // Setup content listeners
    this.setupContentListeners();
    
    // Setup address bar listeners if not a file
    if (this.itemData.type !== "file") {
      this.setupAddressBarListeners();
    }
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
    if (this.itemData.type === "file") {
      setupNotepadListeners(this.window);
    } else {
      setupFolderListeners(
        this.window,
        this.navigateToContent.bind(this),
        this.displayFileContent.bind(this)
      );
    }
  }

  navigateToContent(itemKey) {
    let newPath;
    if (!this.currentPath) {
      newPath = itemKey;
    } else {
      const cleanPath = this.currentPath.split('.children.').join('.');
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
      const cleanPath = this.currentPath.split('.children.').join('.');
      filePath = `${cleanPath}.children.${itemKey}`;
    }
    
    const fileWindow = createNewWindow(filePath);
    fileWindow.focus();
  }

  generateContent(item = this.itemData) {
    if (item.type === "file") {
      if (this.currentPath.includes('packOfPaws')) {
        return generateProfileContent(this.windowId, item.title, this.currentPath);
      }
      return generateNotepadContent(this.windowId, item.title, this.currentPath);
    } else if (item.children) {
      return generateFolderView(item.children);
    }
    return `<div class="file-view">Content for ${item.title}</div>`;
  }

  createTaskbarButton(title) {
    const taskbarWindows = document.getElementById("taskbar-windows");
    const taskbarItem = document.createElement("div");
    taskbarItem.className = "taskbar-item";
    taskbarItem.id = `taskbar-${this.windowId}`;
    
    // Different icon for files vs folders
    const icon = this.itemData.type === "file" ? "📝" : "📁";
    
    taskbarItem.innerHTML = `
      <span class="window-icon">${icon}</span>
      <span class="window-title">${title}${this.itemData.type === "file" ? " - Notepad" : ""}</span>
    `;
    
    taskbarItem.addEventListener("click", () => this.toggleMinimize());
    taskbarWindows.appendChild(taskbarItem);
    this.taskbarButton = taskbarItem;
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

    // Store current dimensions and position before maximizing
    this.originalDimensions = {
      width: this.window.style.width || "400px",
      height: this.window.style.height || "auto",
      transform: this.window.style.transform || `translate(${this.xOffset}px, ${this.yOffset}px)`,
    };

    // Different dimensions for file windows
    const taskbarHeight = 30;
    const dimensions = this.itemData.type === "file" 
      ? {
          width: "600px",
          height: "400px",
        }
      : {
          width: "1024px",
          height: `${800 - taskbarHeight}px`,
        };

    Object.assign(this.window.style, {
      top: `${taskbarHeight}px`,
      left: "0",
      ...dimensions,
      transform: "none", // Reset transform when maximized
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
    
    // Clear URL if this was the last window
    if (router.getWindows().size === 0) {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    } else {
      // Update URL to show the currently focused window
      const focusedWindow = Array.from(document.querySelectorAll('.custom-card'))
        .find(card => card.style.zIndex === "2");
        
      if (focusedWindow) {
        const windowInstance = Array.from(router.getWindows().values())
          .find(w => w.windowId === focusedWindow.id);
          
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
    const pathSegments = this.currentPath.split('.');
    // Remove 'children' from the path if present
    const cleanedSegments = pathSegments.filter(segment => segment !== 'children');
    return cleanedSegments.slice(0, -1).join('.');
  }

  // Navigate up one level
  navigateUp() {
    const parentPath = this.getParentPath();
    if (parentPath) {
      this.navigateToPath(parentPath);
    }
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
    const selectedElements = this.window.querySelectorAll('.folder-item.selected');
    return Array.from(selectedElements).map(element => ({
      key: element.dataset.key,
      type: element.dataset.type
    }));
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
    return item && (item.type === "folder" || item.type === "drive" || item.type === "root");
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
  if (path.startsWith('my-')) {
    const mappedKey = menuMap[path];
    if (mappedKey) {
      return new WindowManager(windowId, path);
    }
  }
  
  return new WindowManager(windowId, path);
}