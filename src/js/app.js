import { initSleep } from "./sleep.js";
import { initNutrition } from "./nutrition.js";
import { initFitness } from "./fitness.js";

/* =========================================================
   APPLICATION CONFIGURATION
   ========================================================= */

const DEFAULT_SECTION = "home";

const VALID_SECTIONS = ["home", "sleep", "nutrition", "fitness"];

const DATA_URL = "/data.json";

/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const sections = document.querySelectorAll(".page-section");

const navigationLinks = document.querySelectorAll(".nav-link");

const navigationList = document.querySelector("#main-navigation");

const menuToggle = document.querySelector(".menu-toggle");

/* =========================================================
   LOAD LOCAL JSON DATA
   ========================================================= */


async function loadData() {
  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(
        `Unable to load data.json: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error loading local data.json:", error);
    throw error;
  }
}

/* =========================================================
   STATIC CONTENT RENDERING
   ========================================================= */


function renderSectionHeader(container, data) {
  if (!container || !data) {
    return;
  }

  const iconMap = {
    SLEEP: "src/public/sleep.svg",
    NUTRITION: "src/public/nutrition.svg",
    FITNESS: "src/public/fitness.svg",
  };

  const icon = iconMap[data.title] || "";

  container.innerHTML = `
    <div class="section-heading-icon" aria-hidden="true">
      <img src="${data.image}" alt="">
    </div>

    <div>
      <h1 id="${data.title.toLowerCase()}-title">
        ${data.title}
      </h1>

      <p>
        ${data.description}
      </p>
    </div>
  `;
}


function renderHome(data) {
  const homeHeader = document.querySelector("#home-header");
  const homeCards = document.querySelector("#home-cards");
  const homeCta = document.querySelector("#home-cta");

  if (!homeHeader || !homeCards || !homeCta) {
    return;
  }

  homeHeader.innerHTML = `
    <h1 id="home-title">
      ${data.title}
    </h1>

    <p class="home-tagline">
      ${data.tagline}
    </p>

    <div class="wellness-message">

      <div class="wellness-icons" aria-hidden="true">

        ${data.wellnessIcons
          .map(
            (icon) => `
              <span>
                <img src="${icon.image}" alt="">
              </span>
            `,
          )
          .join("")}

      </div>

      <p>
        ${data.wellnessMessage}
      </p>

    </div>
  `;

  homeCards.innerHTML = data.cards
    .map(
      (card) => `
        <article class="home-card">

          <div class="home-card-icon" aria-hidden="true">
            <img src="${card.icon}" alt="">
          </div>

          <h2>
            ${card.title}
          </h2>

          <p>
            ${card.description}
          </p>

          <button
            type="button"
            class="card-button"
            data-section="${card.section}"
          >
            ${card.buttonText}
          </button>

        </article>
      `,
    )
    .join("");

  homeCta.innerHTML = `
    <button
      type="button"
      class="primary-button"
      data-section="${data.cta.section}"
    >
      ${data.cta.text}
    </button>
  `;
}


function renderSleep(data) {
  renderSectionHeader(document.querySelector("#sleep-header"), data);

  document.querySelector("#sleep-calculator-title").textContent =
    data.calculatorTitle;

  document.querySelector("#bedtime-label").textContent = data.bedtimeLabel;

  document.querySelector("#wake-time-label").textContent = data.wakeTimeLabel;

  document.querySelector("#calculate-sleep").textContent = data.calculateButton;

  document.querySelector("#sleep-result-label").textContent = data.resultLabel;

  document.querySelector("#save-sleep").textContent = data.saveButton;

  document.querySelector("#sleep-history-title").textContent =
    data.historyTitle;

  document.querySelector("#sleep-history-description").textContent =
    data.historyDescription;

  document.querySelector("#sleep-empty-message").textContent =
    data.emptyMessage;

  document.querySelector("#clear-history").textContent =
    data.clearHistoryButton;
}

/**
 * Renders Nutrition static content using data.json.
 *
 * @param {Object} data - Nutrition data.
 */
function renderNutrition(data) {
  renderSectionHeader(document.querySelector("#nutrition-header"), data);

  document.querySelector("#recipe-search").placeholder = data.searchPlaceholder;

  document.querySelector("#recipe-search-button").textContent =
    data.searchButton;

  document.querySelector("#recipe-results-title").textContent =
    data.recipesTitle;

  document.querySelector("#favorite-recipes-title").textContent =
    data.savedRecipesTitle;

  document.querySelector("#favorite-recipes-description").textContent =
    data.savedRecipesDescription;
}

/**
 * Renders Fitness static content using data.json.
 *
 * @param {Object} data - Fitness data.
 */
function renderFitness(data) {
  renderSectionHeader(document.querySelector("#fitness-header"), data);

  document.querySelector("#exercise-filter-title").textContent =
    data.filterTitle;

  document.querySelector("#exercise-results-title").textContent =
    data.exerciseTitle;

  const filterContainer = document.querySelector("#fitness-filter-buttons");

  if (!filterContainer) {
    return;
  }

  filterContainer.innerHTML = data.muscles
    .map(
      (muscle, index) => `
        <button
          type="button"
          class="filter-button${index === 0 ? " active" : ""}"
          data-muscle="${muscle.value}"
          aria-pressed="${index === 0 ? "true" : "false"}"
        >
          ${muscle.name}
        </button>
      `,
    )
    .join("");
}

/**
 * Renders all static content from data.json.
 *
 * @param {Object} data - Complete application data.
 */
function renderStaticContent(data) {
  renderHome(data.home);
  renderSleep(data.sleep);
  renderNutrition(data.nutrition);
  renderFitness(data.fitness);
}

/* =========================================================
   NAVIGATION HELPERS
   ========================================================= */

/**
 * Returns the section requested by the URL hash.
 *
 * @returns {string} Valid section name.
 */
function getSectionFromHash() {
  const hash = window.location.hash.replace("#", "").trim();

  if (VALID_SECTIONS.includes(hash)) {
    return hash;
  }

  return DEFAULT_SECTION;
}

/**
 * Updates the active state of navigation links.
 *
 * @param {string} sectionId - Current section.
 */
function updateNavigation(sectionId) {
  navigationLinks.forEach((link) => {
    const isActive = link.dataset.section === sectionId;

    link.classList.toggle("active", isActive);

    link.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

/**
 * Shows only the requested application section.
 *
 * @param {string} sectionId - Section to display.
 */
function showSection(sectionId) {
  const validSection = VALID_SECTIONS.includes(sectionId)
    ? sectionId
    : DEFAULT_SECTION;

  sections.forEach((section) => {
    const isVisible = section.id === validSection;

    section.hidden = !isVisible;

    section.classList.toggle("active-section", isVisible);
  });

  updateNavigation(validSection);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/**
 * Navigates to a section and updates the URL hash.
 *
 * @param {string} sectionId - Target section.
 */
function navigateTo(sectionId) {
  if (!VALID_SECTIONS.includes(sectionId)) {
    sectionId = DEFAULT_SECTION;
  }

  if (window.location.hash !== `#${sectionId}`) {
    window.location.hash = sectionId;
  } else {
    showSection(sectionId);
  }
}

/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

/**
 * Opens or closes the mobile navigation menu.
 *
 * @param {boolean} forceState - Optional forced state.
 */
function toggleMobileMenu(forceState) {
  if (!navigationList || !menuToggle) {
    return;
  }

  const isCurrentlyOpen = navigationList.classList.contains("is-open");

  const shouldOpen =
    typeof forceState === "boolean" ? forceState : !isCurrentlyOpen;

  navigationList.classList.toggle("is-open", shouldOpen);

  menuToggle.setAttribute("aria-expanded", String(shouldOpen));

  menuToggle.setAttribute(
    "aria-label",
    shouldOpen ? "Close navigation menu" : "Open navigation menu",
  );
}

/**
 * Closes the mobile menu.
 */
function closeMobileMenu() {
  toggleMobileMenu(false);
}

/* =========================================================
   EVENT HANDLERS
   ========================================================= */

/**
 * Handles clicks on elements with data-section.
 *
 * @param {MouseEvent} event - Click event.
 */
function handleSectionClick(event) {
  const target = event.target.closest("[data-section]");

  if (!target) {
    return;
  }

  const sectionId = target.dataset.section;

  if (!sectionId) {
    return;
  }

  if (target.tagName.toLowerCase() === "a") {
    closeMobileMenu();
    return;
  }

  event.preventDefault();

  navigateTo(sectionId);

  closeMobileMenu();
}

/**
 * Handles browser hash changes.
 */
function handleHashChange() {
  const sectionId = getSectionFromHash();

  showSection(sectionId);

  closeMobileMenu();
}

/**
 * Handles the mobile navigation button.
 */
function handleMenuToggle() {
  toggleMobileMenu();
}

/**
 * Closes the mobile menu when clicking outside it.
 *
 * @param {MouseEvent} event - Click event.
 */
function handleDocumentClick(event) {
  if (!navigationList || !menuToggle) {
    return;
  }

  const clickedInsideNavigation = navigationList.contains(event.target);

  const clickedMenuButton = menuToggle.contains(event.target);

  if (
    navigationList.classList.contains("is-open") &&
    !clickedInsideNavigation &&
    !clickedMenuButton
  ) {
    closeMobileMenu();
  }
}

/**
 * Closes the mobile navigation with Escape.
 *
 * @param {KeyboardEvent} event - Keyboard event.
 */
function handleKeyboard(event) {
  if (event.key !== "Escape") {
    return;
  }

  closeMobileMenu();
}

/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupNavigation() {
  /*
   * The Home buttons are now created dynamically
   * from data.json, so they must be selected here,
   * after the JSON has been rendered.
   */
  const sectionButtons = document.querySelectorAll("[data-section]");

  sectionButtons.forEach((button) => {
    button.addEventListener("click", handleSectionClick);
  });

  window.addEventListener("hashchange", handleHashChange);

  if (menuToggle) {
    menuToggle.addEventListener("click", handleMenuToggle);
  }

  document.addEventListener("click", handleDocumentClick);

  document.addEventListener("keydown", handleKeyboard);
}

/* =========================================================
   MODULE INITIALIZATION
   ========================================================= */

/**
 * Initializes all application components.
 */
async function initApp() {
  /*
   * First load the local JSON file.
   */
  try {
    const data = await loadData();

    /*
     * Inject all static content from data.json
     * into the existing HTML containers.
     */
    renderStaticContent(data);
  } catch (error) {
    console.error("Application data initialization failed:", error);

    return;
  }

  /*
   * Set the initial SPA section after
   * the static content has been rendered.
   */
  showSection(getSectionFromHash());

  setupNavigation();

  /*
   * Initialize each independent module.
   */
  try {
    initSleep();
  } catch (error) {
    console.error("Sleep module initialization failed:", error);
  }

  try {
    await initNutrition();
  } catch (error) {
    console.error("Nutrition module initialization failed:", error);
  }

  try {
    await initFitness();
  } catch (error) {
    console.error("Fitness module initialization failed:", error);
  }
}

/* =========================================================
   APPLICATION START
   ========================================================= */

document.addEventListener("DOMContentLoaded", initApp);

document.querySelector("#currentyear").textContent = new Date().getFullYear();

/* =========================================================
   MODULE EXPORTS
   ========================================================= */

export {
  initApp,
  showSection,
  navigateTo,
  getSectionFromHash,
  loadData,
  renderStaticContent,
};
