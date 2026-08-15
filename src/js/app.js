import { initSleep } from "./sleep.js";
import { initNutrition } from "./nutrition.js";
import { initFitness } from "./fitness.js";

const DATA_URL = "/data.json";

const PAGE_MODULES = {
  "sleep.html": initSleep,
  "nutrition.html": initNutrition,
  "fitness.html": initFitness,
};

//json data

async function loadData() {
  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(
        `Unable to load data.json: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error loading local data.json:", error);
    throw error;
  }
}

//paths detections

function getCurrentPage() {
  const pathname = window.location.pathname;

  const page = pathname.split("/").pop();

  return page || "index.html";
}

//Navgitaion

function updateActiveNavigation() {
  const currentPage = getCurrentPage();

  const navigationLinks = document.querySelectorAll(".nav-link");

  navigationLinks.forEach((link) => {
    const linkPage = link.getAttribute("href");

    const isActive = linkPage === currentPage;

    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

//MObile navigation
//events keydown with escape
function initMobileNavigation() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navigationList = document.querySelector("#main-navigation");

  if (!menuToggle || !navigationList) {
    return;
  }

  function toggleMenu(forceState) {
    const currentlyOpen = navigationList.classList.contains("is-open");

    const shouldOpen =
      typeof forceState === "boolean" ? forceState : !currentlyOpen;

    navigationList.classList.toggle("is-open", shouldOpen);

    menuToggle.setAttribute("aria-expanded", String(shouldOpen));

    menuToggle.setAttribute(
      "aria-label",
      shouldOpen ? "Close navigation menu" : "Open navigation menu",
    );
  }

  function closeMenu() {
    toggleMenu(false);
  }

  menuToggle.addEventListener("click", () => {
    toggleMenu();
  });

  navigationList.addEventListener("click", (event) => {
    const link = event.target.closest("a");

    if (link) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    const clickedInsideNavigation = navigationList.contains(event.target);

    const clickedMenuButton = menuToggle.contains(event.target);

    if (
      navigationList.classList.contains("is-open") &&
      !clickedInsideNavigation &&
      !clickedMenuButton
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

//Static content

function renderSectionHeader(container, data) {
  if (!container || !data) {
    return;
  }

  container.innerHTML = `
    <div class="section-heading-icon" aria-hidden="true">
      <img src="${data.image || ""}" alt="">
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

//content home

function renderHome(data) {
  const homeHeader = document.querySelector("#home-header");
  const homeCards = document.querySelector("#home-cards");
  const homeCta = document.querySelector("#home-cta");

  if (!homeHeader || !homeCards || !homeCta || !data) {
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

          <a
            href="${card.section}.html"
            class="card-button"
          >
            ${card.buttonText}
          </a>

        </article>
      `,
    )
    .join("");

  homeCta.innerHTML = `
    <a
      href="${data.cta.section}.html"
      class="primary-button"
    >
      ${data.cta.text}
    </a>
  `;
}

//Sleep content

function renderSleep(data) {
  const header = document.querySelector("#sleep-header");

  if (!header || !data) {
    return;
  }

  renderSectionHeader(header, data);

  const calculatorTitle = document.querySelector("#sleep-calculator-title");

  const bedtimeLabel = document.querySelector("#bedtime-label");

  const wakeTimeLabel = document.querySelector("#wake-time-label");

  const calculateButton = document.querySelector("#calculate-sleep");

  const resultLabel = document.querySelector("#sleep-result-label");

  const saveButton = document.querySelector("#save-sleep");

  const historyTitle = document.querySelector("#sleep-history-title");

  const historyDescription = document.querySelector(
    "#sleep-history-description",
  );

  const emptyMessage = document.querySelector("#sleep-empty-message");

  const clearHistory = document.querySelector("#clear-history");

  if (calculatorTitle) {
    calculatorTitle.textContent = data.calculatorTitle;
  }

  if (bedtimeLabel) {
    bedtimeLabel.textContent = data.bedtimeLabel;
  }

  if (wakeTimeLabel) {
    wakeTimeLabel.textContent = data.wakeTimeLabel;
  }

  if (calculateButton) {
    calculateButton.textContent = data.calculateButton;
  }

  if (resultLabel) {
    resultLabel.textContent = data.resultLabel;
  }

  if (saveButton) {
    saveButton.textContent = data.saveButton;
  }

  if (historyTitle) {
    historyTitle.textContent = data.historyTitle;
  }

  if (historyDescription) {
    historyDescription.textContent = data.historyDescription;
  }

  if (emptyMessage) {
    emptyMessage.textContent = data.emptyMessage;
  }

  if (clearHistory) {
    clearHistory.textContent = data.clearHistoryButton;
  }
}

//Nutrition static content

function renderNutrition(data) {
  const header = document.querySelector("#nutrition-header");

  if (!header || !data) {
    return;
  }

  renderSectionHeader(header, data);

  const searchInput = document.querySelector("#recipe-search");

  const searchButton = document.querySelector("#recipe-search-button");

  const resultsTitle = document.querySelector("#recipe-results-title");

  const favoritesTitle = document.querySelector("#favorite-recipes-title");

  const favoritesDescription = document.querySelector(
    "#favorite-recipes-description",
  );

  if (searchInput) {
    searchInput.placeholder = data.searchPlaceholder;
  }

  if (searchButton) {
    searchButton.textContent = data.searchButton;
  }

  if (resultsTitle) {
    resultsTitle.textContent = data.recipesTitle;
  }

  if (favoritesTitle) {
    favoritesTitle.textContent = data.savedRecipesTitle;
  }

  if (favoritesDescription) {
    favoritesDescription.textContent = data.savedRecipesDescription;
  }
}

//Fitness static content
function renderFitness(data) {
  const header = document.querySelector("#fitness-header");

  if (!header || !data) {
    return;
  }

  renderSectionHeader(header, data);

  const filterTitle = document.querySelector("#exercise-filter-title");

  const exerciseTitle = document.querySelector("#exercise-results-title");

  const filterContainer = document.querySelector("#fitness-filter-buttons");

  if (filterTitle) {
    filterTitle.textContent = data.filterTitle;
  }

  if (exerciseTitle) {
    exerciseTitle.textContent = data.exerciseTitle;
  }

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

//static content for the current page only

function renderCurrentPageContent(data) {
  const currentPage = getCurrentPage();

  if (currentPage === "index.html") {
    renderHome(data.home);
  }

  if (currentPage === "sleep.html") {
    renderSleep(data.sleep);
  }

  if (currentPage === "nutrition.html") {
    renderNutrition(data.nutrition);
  }

  if (currentPage === "fitness.html") {
    renderFitness(data.fitness);
  }
}

//Mobile Initializes the module belonging to the current page

async function initializeCurrentModule() {
  const currentPage = getCurrentPage();

  const moduleInitializer = PAGE_MODULES[currentPage];

  if (!moduleInitializer) {
    return;
  }

  try {
    await moduleInitializer();
  } catch (error) {
    console.error(`Unable to initialize ${currentPage}:`, error);
  }
}

//Aplication initilization

async function initApp() {
  try {
    //Header and footer are now included, directly in every HTML page.

    updateActiveNavigation();

    initMobileNavigation();

    //Get the current year

    const currentYear = document.querySelector("#currentyear");

    if (currentYear) {
      currentYear.textContent = new Date().getFullYear();
    }

    //Load local static content
    const data = await loadData();

    renderCurrentPageContent(data);

    //Initialize only the module, required by the current page
    await initializeCurrentModule();
  } catch (error) {
    console.error("Application initialization failed:", error);
  }
}

//start application

document.addEventListener("DOMContentLoaded", initApp);

export {
  initApp,
  loadData,
  getCurrentPage,
  updateActiveNavigation,
  renderCurrentPageContent,
};
