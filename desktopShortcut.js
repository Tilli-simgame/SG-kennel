// desktopShortcut.js
import { createNewWindow } from './windowManager.js';

export function createShortcut(path, title, icon) {
  const shortcut = document.createElement('div');
  shortcut.className = 'desktop-shortcut';
  shortcut.dataset.path = path;
  
  shortcut.innerHTML = `
    <div class="shortcut-icon">${icon}</div>
    <div class="shortcut-title">${title}</div>
  `;

  // Add double click handler
  shortcut.addEventListener('dblclick', () => {
    createNewWindow(path);
  });

  // Add selection handling
  shortcut.addEventListener('click', (e) => {
    // Deselect all other shortcuts
    document.querySelectorAll('.desktop-shortcut').forEach(s => {
      s.classList.remove('selected');
    });
    shortcut.classList.add('selected');
  });

  return shortcut;
}

// Add styles for shortcuts
const style = document.createElement('style');
style.textContent = `
  .desktop-shortcut {
    position: relative;
    width: 70px;
    height: 90px;
    margin: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .desktop-shortcut.selected {
    background-color: rgba(100, 149, 237, 0.3);
    border-radius: 5px;
  }

  .shortcut-icon {
    font-size: 32px;
    margin-bottom: 5px;
    padding: 5px;
  }

  .shortcut-title {
    text-align: center;
    color: white;
    font-size: 12px;
    word-wrap: break-word;
    max-width: 100%;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.7);
  }

  .desktop-shortcut:hover .shortcut-title {
    color: #add8e6;
  }
`;
document.head.appendChild(style);