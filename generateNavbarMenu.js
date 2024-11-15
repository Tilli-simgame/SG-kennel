// generateNavbarMenu.js
import { kennelStructure, menuMap } from "./kennelStructure.js";

function generateNestedDropdownItems(children, parentId) {
  return Object.entries(children)
    .map(([key, item]) => {
      const hasChildren =
        item.children && Object.keys(item.children).length > 0;
      const itemId = parentId ? `${parentId}-${key}` : key;

      if (hasChildren) {
        return `
        <li class="dropend">
          <a class="dropdown-item d-flex justify-content-between align-items-center" href="#" id="${itemId}" data-bs-toggle="dropdown" data-bs-auto-close="outside">
            <span class="d-flex align-items-center gap-2">
              <span class="menu-icon">${item.icon}</span>
              ${item.title}
            </span>
            <span class="ms-2">▶</span>
          </a>
          <ul class="dropdown-menu">
            ${generateNestedDropdownItems(item.children, itemId)}
          </ul>
        </li>
      `;
      }

      return `
      <li>
        <a class="dropdown-item d-flex align-items-center gap-2" href="#" id="${itemId}">
          <span class="menu-icon">${item.icon}</span>
          ${item.title}
        </a>
      </li>
    `;
    })
    .join("");
}

export function generateStartMenu() {
  const menuItems = Object.entries(menuMap)
    .map(([menuId, structureKey]) => {
      const item = kennelStructure[structureKey];
      const hasChildren =
        item.children && Object.keys(item.children).length > 0;

      if (hasChildren) {
        return `
        <li class="dropend">
          <a class="dropdown-item d-flex justify-content-between align-items-center" href="#" id="${menuId}" data-bs-toggle="dropdown" data-bs-auto-close="outside">
            <span class="d-flex align-items-center gap-2">
              <span class="menu-icon">${item.icon}</span>
              ${item.title}
            </span>
            <span class="ms-2">▶</span>
          </a>
          <ul class="dropdown-menu">
            ${generateNestedDropdownItems(item.children, menuId)}
          </ul>
        </li>
      `;
      }

      return `
      <li>
        <a class="dropdown-item d-flex align-items-center gap-2" href="#" id="${menuId}">
          <span class="menu-icon">${item.icon}</span>
          ${item.title}
        </a>
      </li>
    `;
    })
    .join("");

  return `
    <li class="dropdown-item-header">
      <span class="user-name">User Name</span>
    </li>
    <li><hr class="dropdown-divider" /></li>
    ${menuItems}
  `;
}
