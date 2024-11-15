// notepadWindow.js
export function getNotepadWindowHTML(windowId, title, content) {
  return `
    <div class="card custom-card notepad-window" id="${windowId}" data-window-state="normal">
      <div class="card-header d-flex justify-content-between align-items-center" id="${windowId}-header">
        <span>${title} - Notepad</span>
        <div class="title-controls">
          <button class="btn btn-sm window-control" data-action="minimize" title="Minimize">-</button>
          <button class="btn btn-sm window-control" data-action="maximize" title="Maximize">□</button>
          <button class="btn btn-sm window-control" data-action="close" title="Close">×</button>
        </div>
      </div>
      <div class="menu-bar">
        <div class="menu-item">File</div>
        <div class="menu-item">Edit</div>
        <div class="menu-item">Format</div>
        <div class="menu-item">View</div>
        <div class="menu-item">Help</div>
      </div>
      <div class="card-body notepad-content">
        ${content}
      </div>
    </div>
  `;
}

export function generateNotepadContent(title) {
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

  .menu-bar {
    display: flex;
    background-color: #f0f0f0;
    border-bottom: 1px solid #ddd;
    padding: 2px 0;
  }

  .menu-item {
    padding: 2px 8px;
    cursor: pointer;
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
  }
`;

const style = document.createElement('style');
style.textContent = notepadStyles;
document.head.appendChild(style);