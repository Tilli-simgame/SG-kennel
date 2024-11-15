// folderWindow.js
export function getFolderWindowHTML(windowId, title, pathStructure, content) {
  return `
    <div class="card custom-card" id="${windowId}" data-window-state="normal">
      <div class="card-header d-flex justify-content-between align-items-center" id="${windowId}-header">
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
          ${pathStructure}
        </div>
      </div>
      <div class="card-body">
        ${content}
      </div>
    </div>
  `;
}

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

export function setupFolderListeners(window, navigateToContent, displayFileContent) {
  window.querySelectorAll(".folder-item").forEach((item) => {
    item.addEventListener("dblclick", () => {
      const itemKey = item.dataset.key;
      const itemType = item.dataset.type;

      if (itemType === "folder" || itemType === "drive" || itemType === "root") {
        navigateToContent(itemKey);
      } else {
        displayFileContent(itemKey);
      }
    });

    item.addEventListener("click", () => {
      window.querySelectorAll(".folder-item")
        .forEach((i) => i.classList.remove("selected"));
      item.classList.add("selected");
    });
  });
}