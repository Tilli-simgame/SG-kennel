// simpleStickyNote.js

export const STICKY_COLORS = {
  yellow: '#fff740',
  salmon: '#ffa07a',
  green: '#98fb98',
  blue: '#87cefa',
  purple: '#dda0dd',
  pink: '#ffb6c1',
  orange: '#ffa500',
  white: '#ffffff',
  grey: '#d3d3d3'
};

export class StickyNote {
  constructor(title = '', content = '', position = { x: 50, y: 50 }, color = STICKY_COLORS.yellow) {
    this.id = `sticky-${Date.now()}`;
    this.title = title;
    this.content = content;
    this.position = position;
    this.color = STICKY_COLORS[color] || color; // Accept both color name or direct hex
    this.createNote();
    this.setupEventListeners();
  }

  createNote() {
    const desktop = document.querySelector('.desktop');
    const noteHTML = `
      <div class="sticky-note" id="${this.id}">
        <div class="sticky-header">
          <div class="sticky-title">${this.title}</div>
          <div class="sticky-controls">
            <button class="close-sticky">×</button>
          </div>
        </div>
        <div class="sticky-content">${this.content}</div>
      </div>
    `;

    desktop.insertAdjacentHTML('beforeend', noteHTML);
    this.element = document.getElementById(this.id);
    this.element.style.backgroundColor = this.color;
    
    // Set position
    this.element.style.left = `${this.position.x}px`;
    this.element.style.top = `${this.position.y}px`;
  }

  setupEventListeners() {
    // Close button
    this.element.querySelector('.close-sticky').addEventListener('click', () => {
      this.element.remove();
    });

    // Focus handling
    this.element.addEventListener('mousedown', () => this.focus());
  }

  focus() {
    const allStickies = document.querySelectorAll('.sticky-note');
    allStickies.forEach(sticky => sticky.style.zIndex = '1');
    this.element.style.zIndex = '2';
  }
}

// Add styles
const style = document.createElement('style');
style.textContent = `
  .sticky-note {
    position: absolute;
    width: 200px;
    height: 150px;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
  }

  .sticky-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .sticky-title {
    font-weight: bold;
    font-size: 14px;
    flex-grow: 1;
    padding-right: 10px;
  }

  .sticky-controls button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 5px;
    font-size: 16px;
    opacity: 0.5;
  }

  .sticky-controls button:hover {
    opacity: 1;
  }

  .sticky-content {
    flex-grow: 1;
    overflow: auto;
    padding: 5px;
    font-size: 12px;
  }
`;
document.head.appendChild(style);