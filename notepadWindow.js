// notepadWindow.js

export function getNotepadWindowHTML(windowId, title, content) {
  return `
    <div class="card custom-card" id="${windowId}" data-window-state="normal">
      <div class="d-flex justify-content-between align-items-center title-bar" id="${windowId}-header">
        <span class="title-bar-text">${title}</span>
        <div class="title-bar-controls">
          <button data-action="minimize" title="Minimize" aria-label="Minimize"></button>
          <button data-action="maximize" title="Maximize" aria-label="Maximize"></button>
          <button data-action="close" title="Close" aria-label="Close"></button>
        </div>
      </div>
      <div class="toolbar">
        <ul class="menu-bar">
          <li class="menu-item disabled">File</li>
          <li class="menu-item disabled">Edit</li>
          <li class="menu-item disabled">View</li>
          <li class="menu-item disabled">Favorites</li>
          <li class="menu-item disabled">Tools</li>
          <li class="menu-item disabled">Help</li>
        </ul>
      </div>
      <div class="card-body">
        ${content}
      </div>
    </div>
  `;
}

export function generateNotepadContent(windowId, title) {
  return `
    <div class="file-content notepad-style">
      <pre contenteditable="true" class="notepad-text">This is the content of ${title}. 
You can edit this text.

This file was created in our kennel management system.</pre>
    </div>
  `;
}

export function setupNotepadListeners(window) {
  const textArea = window.querySelector('.notepad-text');
  if (textArea) {
    let saveTimeout;
    textArea.addEventListener('input', () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        console.log('Content saved:', textArea.textContent);
      }, 1000);
    });

    textArea.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        console.log('Manual save triggered');
      }
    });
  }
}

// Add Notepad styles
const notepadStyles = `
  .notepad-window {
    min-width: 600px;
    min-height: 300px;
  }

  .notepad-window .card-header {
    background-color: #f0f0f0;
    border-bottom: 1px solid #ddd;
  }

  .menu-item:hover {
    background-color: #e0e0e0;
  }

  .notepad-content {
    padding: 0;
    background-color: white;
  }

  .notepad-text {
    width: 100%;
    height: 100%;
    min-height: 200px;
    margin: 0;
    padding: 8px;
    border: none;
    font-family: 'Consolas', monospace;
    white-space: pre-wrap;
    outline: none;
    resize: none;
    background-color: white;
    color: black;
  }
`;

// Add styles to document
const style = document.createElement('style');
style.textContent = notepadStyles;
document.head.appendChild(style);