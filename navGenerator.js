// navGenerator.js
import { kennelStructure } from "./kennelStructure.js";

function generateDropdownItems(children, parentPath) {
  return Object.entries(children)
    .map(
      ([key, item]) => `
    <li>
      <a class="dropdown-item" href="#" data-path="${parentPath}.${key}">
        <span class="menu-icon">${item.icon}</span> ${item.title.split(" (")[0]}
      </a>
    </li>
  `
    )
    .join("");
}

export function generateNavigation() {
  const navItems = Object.entries(kennelStructure)
    .map(
      ([key, item]) => `
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" href="#" id="${key}Dropdown" role="button" data-bs-toggle="dropdown">
        <span class="menu-icon">${item.icon}</span> ${item.title.split(" (")[0]}
      </a>
      <ul class="dropdown-menu" aria-labelledby="${key}Dropdown">
        ${item.children ? generateDropdownItems(item.children, key) : ""}
      </ul>
    </li>
  `
    )
    .join("");

  return `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Kennel XP</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            ${navItems}
          </ul>
        </div>
      </div>
    </nav>
  `;
}
