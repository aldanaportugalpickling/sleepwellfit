

import { initSleep } from "./sleep.js";
import { initNutrition } from "./nutrition.js";
import { initFitness } from "./fitness.js";

/* =========================================================
   APPLICATION CONFIGURATION
   ========================================================= */

const DEFAULT_SECTION = "home";

const VALID_SECTIONS = ["home", "sleep", "nutrition", "fitness"];

/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const sections = document.querySelectorAll(".page-section");

const navigationLinks = document.querySelectorAll(".nav-link");

const navigationList = document.querySelector("#main-navigation");

const menuToggle = document.querySelector(".menu-toggle");

const sectionButtons = document.querySelectorAll("[data-section]");

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

  /*
   * Navigation anchors should use the hash normally,
   * while buttons need explicit SPA navigation.
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
   * Set the initial SPA section before loading
   * the individual components.
   */
  showSection(getSectionFromHash());

  setupNavigation();

  /*
   * Initialize each independent module.
   *
   * They are initialized separately so an error
   * in one API does not prevent the rest of the
   * application from starting.
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

//Get the current year and the Last modified
document.querySelector('#currentyear').textContent = new Date().getFullYear();

/* =========================================================
   MODULE EXPORTS
   ========================================================= */

export { initApp, showSection, navigateTo, getSectionFromHash };
