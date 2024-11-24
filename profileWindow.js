// profileWindow.js

export function getProfileWindowHTML(windowId, title, content) {
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

export function generateProfileContent(windowId, title, path = '') {
  const pathParts = path.split('.');
  const dogName = pathParts[pathParts.length - 1];
  
  // Return initial loading state
  const loadingContent = `
    <div class="file-content profile-style" data-dog-profile="${dogName}">
      ${generateLoadingHTML(windowId)}
    </div>
  `;
  
  // Use setTimeout to allow the window to be created first
  setTimeout(() => {
    fetchDogProfile(dogName)
      .then(dogData => {
        const container = document.querySelector(`[data-dog-profile="${dogName}"]`);
        if (container) {
          container.innerHTML = generateDogProfileHTML(dogData, windowId);
        }
      })
      .catch(error => {
        const container = document.querySelector(`[data-dog-profile="${dogName}"]`);
        if (container) {
          container.innerHTML = generateErrorHTML(error.message, windowId);
        }
      });
  }, 0);
  
  return loadingContent;
}

function generateDogProfileHTML(dogData, windowId) {
  return `
    <div class="window-body">
      <menu role="tablist">
        <button aria-selected="true" aria-controls="overview">Overview</button>
        <button aria-controls="physical">Physical</button>
        <button aria-controls="shows">Shows</button>
        <button aria-controls="breeding">Breeding</button>
      </menu>

      <article role="tabpanel" id="overview">
        <div class="field-row" style="margin-bottom: 10px;">
          <h4 style="margin: 0 10px 0 0;">${dogData.name}</h4>
          <p style="margin: 0;">${dogData.breed}</p>
        </div>
        <fieldset>
          <legend>Basic Information</legend>
          <div class="field-row">
            <label>Born:</label>
            <span>${dogData.dateOfBirth}</span>
          </div>
          <div class="field-row">
            <label>Registration:</label>
            <span>${dogData.registration}</span>
          </div>
          <div class="field-row">
            <p style="margin: 5px 0;">${dogData.description || 'No description available.'}</p>
          </div>
        </fieldset>
      </article>

      <article role="tabpanel" hidden id="physical">
        <fieldset>
          <legend>Physical Characteristics</legend>
          <div class="field-row">
            <label>Color:</label>
            <span>${dogData.color}</span>
          </div>
          <div class="field-row">
            <label>Weight:</label>
            <span>${dogData.weight} kg</span>
          </div>
          <div class="field-row">
            <label>Height:</label>
            <span>${dogData.height} cm</span>
          </div>
        </fieldset>

        <fieldset>
          <legend>Health Information</legend>
          <div class="field-row">
            <label>Health Tests:</label>
            <span>${dogData.healthTests.join(', ')}</span>
          </div>
          <div class="field-row">
            <label>Vaccinations Up to Date:</label>
            <span>${dogData.vaccinationsUpToDate ? 'Yes' : 'No'}</span>
          </div>
        </fieldset>
      </article>

      <article role="tabpanel" hidden id="shows">
        <fieldset>
          <legend>Show Results</legend>
          ${dogData.showResults.map(result => `
            <div class="field-row">
              <label>${result.show}:</label>
              <span>${result.achievement}</span>
            </div>
          `).join('')}
        </fieldset>
      </article>

      <article role="tabpanel" hidden id="breeding">
        <fieldset>
          <legend>Breeding Information</legend>
          <div class="field-row">
            <label>DNA Tests:</label>
            <span>${dogData.dnaTests.join(', ')}</span>
          </div>
          ${dogData.breeding ? `
            <div class="field-row">
              <label>Available for Breeding:</label>
              <span>${dogData.breeding.available ? 'Yes' : 'No'}</span>
            </div>
            <div class="field-row">
              <label>Previous Litters:</label>
              <span>${dogData.breeding.previousLitters}</span>
            </div>
          ` : ''}
        </fieldset>
      </article>

      <section class="field-row" style="justify-content: flex-end; margin-top: 10px;">
        <button>OK</button>
        <button>Cancel</button>
      </section>
    </div>
  `;
}


function generateLoadingHTML(windowId) {
  return `
    <div class="dog-profile-container loading-state" id="dog-profile-${windowId}">
      <div class="win98-fieldset">
        <div class="fieldset-content text-center">
          Loading dog profile...
        </div>
      </div>
    </div>
  `;
}

function generateErrorHTML(error, windowId) {
  return `
    <div class="dog-profile-container error-state" id="dog-profile-${windowId}">
      <div class="win98-fieldset">
        <div class="fieldset-content text-center">
          Error loading dog profile: ${error}
        </div>
      </div>
    </div>
  `;
}

async function fetchDogProfile(dogName) {
  try {
    const response = await fetch(`/dogs/${dogName}.json`);
    if (!response.ok) {
      throw new Error('Dog profile not found');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching dog profile:', error);
    throw error;
  }
}

// Add the CSS styles
const profileStyles = `
  .dog-profile-container {
    padding: 15px;
    font-family: "MS Sans Serif", Arial, sans-serif;
    background-color: #c0c0c0;
    height: 100%;
    overflow-y: auto;
  }

  .win98-fieldset {
    border: 2px solid #808080;
    padding: 10px;
    margin-bottom: 10px;
    background-color: #c0c0c0;
    box-shadow: inset 1px 1px #dfdfdf, inset -1px -1px #0a0a0a;
  }

  .fieldset-header {
    margin-bottom: 8px;
  }

  .fieldset-title {
    font-size: 14px;
    font-weight: bold;
    margin: 0;
    padding: 0;
  }

  .breed-tag {
    font-size: 12px;
    color: #444;
    margin-left: 8px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #222;
  }

  .win98-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .info-list {
    font-size: 12px;
  }

  .info-item {
    padding: 3px 0;
    border-bottom: 1px solid #dfdfdf;
  }

  .info-item:last-child {
    border-bottom: none;
  }

  .description-text {
    font-size: 12px;
    line-height: 1.4;
    margin: 0;
    white-space: pre-wrap;
  }

  .loading-state,
  .error-state {
    font-style: italic;
    color: #444;
    padding: 20px;
    text-align: center;
  }

  .error-state {
    color: #a00;
  }

  .mb-3 {
    margin-bottom: 15px;
  }

  .mt-3 {
    margin-top: 15px;
  }

  .text-center {
    text-align: center;
  }
`;

// Add styles to document
const style = document.createElement('style');
style.textContent = profileStyles;
document.head.appendChild(style);