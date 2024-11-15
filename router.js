// router.js

export class Router {
  constructor() {
    this.windows = new Map();
    this.handleHashChange = this.handleHashChange.bind(this);
    window.addEventListener("hashchange", this.handleHashChange);
  }

  // Convert path segments to internal path format
  convertUrlPathToInternalPath(urlPath) {
    // Remove initial '#' if present and split by '#'
    const segments = urlPath.replace(/^#/, "").split("#");

    // Convert kebab-case to camelCase and join with dots
    return segments
      .map((segment) => segment.replace(/-([a-z])/g, (g) => g[1].toUpperCase()))
      .join(".");
  }

  // Convert internal path to URL format
  convertInternalPathToUrlPath(internalPath) {
    // Split by dots and convert camelCase to kebab-case
    return (
      "#" +
      internalPath
        .split(".")
        .map((segment) => segment.replace(/([A-Z])/g, "-$1").toLowerCase())
        .join("#")
    );
  }

  handleHashChange() {
    const hash = window.location.hash;
    if (!hash) return;

    const internalPath = this.convertUrlPathToInternalPath(hash);

    // Check if we already have a window for this path
    if (!this.windows.has(internalPath)) {
      // We'll need to import createNewWindow here
      this.createWindowCallback?.(internalPath);
    }
  }

  // Update URL when navigating
  updateUrl(internalPath) {
    if (!internalPath) {
      // Clear the URL without triggering a hash change
      history.pushState(
        "",
        document.title,
        window.location.pathname + window.location.search
      );
    } else {
      const urlPath = this.convertInternalPathToUrlPath(internalPath);
      history.pushState(
        "",
        document.title,
        window.location.pathname + window.location.search + urlPath
      );
    }
  }

  // Register a window
  registerWindow(path, windowInstance) {
    this.windows.set(path, windowInstance);
  }

  // Unregister a window
  unregisterWindow(path) {
    this.windows.delete(path);
  }

  // Get all registered windows
  getWindows() {
    return this.windows;
  }

  // Set callback for creating new windows
  setCreateWindowCallback(callback) {
    this.createWindowCallback = callback;
  }

  // Initialize router based on current URL
  initialize() {
    const hash = window.location.hash;
    if (hash) {
      const internalPath = this.convertUrlPathToInternalPath(hash);
      this.createWindowCallback?.(internalPath);
    }
  }
}

// Create and export router instance
export const router = new Router();
