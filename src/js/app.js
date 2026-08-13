import { initSleep } from "./sleep.js";
import { initNutrition } from "./nutrition.js";
import { initFitness } from "./fitness.js";



/* =========================================================
   APPLICATION CONFIGURATION
   ========================================================= */


//json


const CONTENT_URL = "/src/public/json/content.json";

const DEFAULT_SECTION = "home";

const VALID_SECTIONS = ["home", "sleep", "nutrition", "fitness"];

/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const sections = document.querySelectorAll(".page-section");

const navigationList = document.querySelector("#main-navigation");

const menuToggle = document.querySelector(".menu-toggle");

const homeCards = document.querySelector(".home-cards");

const filterButtonsContainer = document.querySelector(".filter-buttons");

const socialLinks = document.querySelector(".social-links");

/* =========================================================
   HTML HELPER
   ========================================================= */

/**
 * Escapes text before inserting it into HTML.
 *
 * @param {string} value - Text to escape.
 * @returns {string} Safe HTML string.
 */
function escapeHTML(value = "") {
  const element = document.createElement("div");

  element.textContent = value;

  return element.innerHTML;
}

/* =========================================================
   CONTENT API
   ========================================================= */

/**
 * Loads the application content from JSON.
 *
 * @returns {Promise<Object>} Content data.
 */
async function loadContent() {
  const response = await fetch(CONTENT_URL);

  if (!response.ok) {
    throw new Error(`Unable to load content.json: ${response.status}`);
  }

  return response.json();
}

/* =========================================================
   NAVIGATION RENDERING
   ========================================================= */

/**
 * Renders the main navigation.
 *
 * @param {Array} navigation - Navigation items.
 */
function renderNavigation(navigation) {
  navigationList.innerHTML = "";

  navigation.forEach((item) => {
    const listItem = document.createElement("li");

    listItem.innerHTML = `
      <a
        href="${escapeHTML(item.href)}"
        class="nav-link"
        data-section="${escapeHTML(item.section)}"
      >
        ${escapeHTML(item.label)}
      </a>
    `;

    navigationList.appendChild(listItem);
  });
}

/* =========================================================
   HOME CARDS
   ========================================================= */

/**
 * Renders the three Home cards.
 *
 * @param {Array} cards - Home card data.
 */
function renderHomeCards(cards) {
  homeCards.innerHTML = "";

  cards.forEach((card) => {
    const article = document.createElement("article");

    article.className = "home-card";

    article.innerHTML = `
      <div class="home-card-icon" aria-hidden="true">
        <img
          src="${escapeHTML(card.icon)}"
          alt=""
        >
      </div>

      <h2>
        ${escapeHTML(card.title)}
      </h2>

      <p>
        ${escapeHTML(card.description)}
      </p>

      <button
        type="button"
        class="card-button"
        data-section="${escapeHTML(card.section)}"
      >
        ${escapeHTML(card.buttonText)}
      </button>
    `;

    homeCards.appendChild(article);
  });
}

/* =========================================================
   FITNESS FILTERS
   ========================================================= */

/**
 * Renders the Fitness filter buttons.
 *
 * @param {Array} filters - Fitness filter data.
 */
function renderFitnessFilters(filters) {
  filterButtonsContainer.innerHTML = "";

  filters.forEach((filter) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = filter.active ? "filter-button active" : "filter-button";

    button.dataset.muscle = filter.muscle;

    button.setAttribute("aria-pressed", String(filter.active));

    button.textContent = filter.label;

    filterButtonsContainer.appendChild(button);
  });
}

/* =========================================================
   FOOTER
   ========================================================= */

/**
 * Renders footer social links.
 *
 * @param {Array} links - Social links.
 */
function renderSocialLinks(links) {
  socialLinks.innerHTML = "";

  links.forEach((link) => {
    const anchor = document.createElement("a");

    anchor.href = link.href;

    anchor.setAttribute("aria-label", link.ariaLabel);

    anchor.textContent = link.label;

    socialLinks.appendChild(anchor);
  });
}

/* =========================================================
   RENDER ALL CONTENT
   ========================================================= */

/**
 * Renders all data-driven content.
 *
 * @param {Object} content - JSON content.
 */
function renderContent(content) {
  renderNavigation(content.navigation);

  renderHomeCards(content.homeCards);

  renderFitnessFilters(content.fitnessFilters);

  renderSocialLinks(content.socialLinks);
}

/* =========================================================
   SPA NAVIGATION
   ========================================================= */

/**
 * Gets the section from the URL hash.
 *
 * @returns {string} Valid section ID.
 */
function getSectionFromHash() {
  const hash = window.location.hash.replace("#", "").trim();

  if (VALID_SECTIONS.includes(hash)) {
    return hash;
  }

  return DEFAULT_SECTION;
}

/**
 * Updates active navigation link.
 *
 * @param {string} sectionId - Current section.
 */
function updateNavigation(sectionId) {
  const navigationLinks = document.querySelectorAll(".nav-link");

  navigationLinks.forEach((link) => {
    const isActive = link.dataset.section === sectionId;

    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

/**
 * Displays one SPA section.
 *
 * @param {string} sectionId - Section ID.
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
 * Navigates to an application section.
 *
 * @param {string} sectionId - Target section.
 */
function navigateTo(sectionId) {
  const target = VALID_SECTIONS.includes(sectionId)
    ? sectionId
    : DEFAULT_SECTION;

  if (window.location.hash !== `#${target}`) {
    window.location.hash = target;
  } else {
    showSection(target);
  }
}

/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

/**
 * Opens or closes mobile navigation.
 *
 * @param {boolean} forceState - Optional state.
 */
function toggleMobileMenu(forceState) {
  if (!navigationList || !menuToggle) {
    return;
  }

  const isOpen = navigationList.classList.contains("is-open");

  const shouldOpen = typeof forceState === "boolean" ? forceState : !isOpen;

  navigationList.classList.toggle("is-open", shouldOpen);

  menuToggle.setAttribute("aria-expanded", String(shouldOpen));

  menuToggle.setAttribute(
    "aria-label",
    shouldOpen ? "Close navigation menu" : "Open navigation menu",
  );
}

/**
 * Closes mobile navigation.
 */
function closeMobileMenu() {
  toggleMobileMenu(false);
}

/* =========================================================
   EVENT HANDLING
   ========================================================= */

/**
 * Handles every element containing data-section.
 *
 * Event delegation is used because navigation links
 * and Home cards are generated dynamically.
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

  /*
   * Navigation anchors already contain the
   * correct #hash, so let the browser update it.
   */
  if (target.tagName.toLowerCase() === "a") {
    closeMobileMenu();
    return;
  }

  event.preventDefault();

  navigateTo(sectionId);

  closeMobileMenu();
}

/**
 * Handles URL hash changes.
 */
function handleHashChange() {
  showSection(getSectionFromHash());

  closeMobileMenu();
}

/**
 * Handles mobile menu button.
 */
function handleMenuToggle() {
  toggleMobileMenu();
}

/**
 * Closes mobile menu when clicking outside.
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
 * Handles Escape key.
 *
 * @param {KeyboardEvent} event - Keyboard event.
 */
function handleKeyboard(event) {
  if (event.key === "Escape") {
    closeMobileMenu();
  }
}

/* =========================================================
   EVENT LISTENER SETUP
   ========================================================= */

function setupNavigation() {
  /*
   * Delegation is intentional.
   *
   * The .nav-link and .card-button elements
   * are created after content.json loads.
   */
  document.addEventListener("click", handleSectionClick);

  window.addEventListener("hashchange", handleHashChange);

  if (menuToggle) {
    menuToggle.addEventListener("click", handleMenuToggle);
  }

  document.addEventListener("click", handleDocumentClick);

  document.addEventListener("keydown", handleKeyboard);
}

/* =========================================================
   APPLICATION INITIALIZATION
   ========================================================= */

/**
 * Initializes the complete application.
 */
async function initApp() {
  try {
    /*
     * 1. Load data.
     */
    const content = await loadContent();

    /*
     * 2. Generate repetitive content.
     */
    renderContent(content);

    /*
     * 3. Configure SPA navigation.
     */
    setupNavigation();

    /*
     * 4. Display the requested section.
     */
    showSection(getSectionFromHash());
  } catch (error) {
    console.error("Unable to initialize application:", error);

    return;
  }

  /*
   * Initialize independent modules
   * separately so one failure does not
   * prevent the rest of the application.
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

/* =========================================================
   EXPORTS
   ========================================================= */

export {
  initApp,
  loadContent,
  renderContent,
  showSection,
  navigateTo,
  getSectionFromHash,
};