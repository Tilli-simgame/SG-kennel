// generateNavbarMenu.js
import { kennelStructure, menuMap } from "./kennelStructure.js";

function generateMainMenuItems() {
  return Object.entries(menuMap)
    .map(([menuId, structureKey]) => {
      const item = kennelStructure[structureKey];
      return `
      <div class="start-menu-item my-item">
        <div class="icon">${item.icon}</div>
        <a class="menu-link" id="${menuId}">
          ${item.title}
        </a>
      </div>
    `;
    })
    .join("");
}

export function generateStartMenu() {
  return `
    <div class="start-menu-header">
      <div class="account-image-wrapper">
        <img src="https://placedog.net/45/48" alt="User">
      </div>
      <h1 class="account-name">Visitor</h1>
    </div>
    <div class="start-menu-body">
      <div class="start-menu-favorites">
        <div class="start-menu-item intent-item">
          <div class="icon">🌐</div>
          <div class="label">
            <div class="intent">Internet</div>
            <div class="program">Internet Explorer</div>
          </div>
        </div>
        <div class="start-menu-item intent-item">
          <div class="icon">📧</div>
          <div class="label">
            <div class="intent">E-mail</div>
            <div class="program">Outlook Express</div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="all-programs">
          <div class="divider"></div>
          <div class="start-menu-item all-programs-button">All Programs</div>
        </div>
      </div>
      <div class="start-menu-shortcuts">
        ${generateMainMenuItems()}
        <div class="divider"></div>
        <div class="start-menu-item">
          <div class="icon">❓</div>
          <div class="label">Help and Support</div>
        </div>
      </div>
    </div>
    <div class="start-menu-footer">
      <button class="log-off-button">
        <div class="icon">🔒</div>
        <span>Log Off</span>
      </button>
    </div>
  `;
}