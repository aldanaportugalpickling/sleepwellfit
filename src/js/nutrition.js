const API_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

const FAVORITES_KEY = "sleepWellFitFavorites";

//Here DOM elements
const searchForm = document.querySelector("#recipe-search-form");
const searchInput = document.querySelector("#recipe-search");
const recipeList = document.querySelector("#recipe-list");
const favoriteList = document.querySelector("#favorite-list");

const recipeModal = document.querySelector("#recipe-modal");
const recipeModalBody = document.querySelector("#recipe-modal-body");
const recipeModalTitle = document.querySelector("#recipe-modal-title");
const recipeModalClose = document.querySelector("#recipe-modal-close");

//Seacrh recipes from API

async function searchRecipes(query) {
  try {
    const response = await fetch(`${API_URL}${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`TheMealDB request failed: ${response.status}`);
    }

    const data = await response.json();

    return data.meals || [];
  } catch (error) {
    console.error("Error searching recipes:", error);
    throw error;
  }
}

//get  a single recipe by its ID

async function getRecipeById(id) {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`,
    );

    if (!response.ok) {
      throw new Error(`Recipe request failed: ${response.status}`);
    }

    const data = await response.json();

    return data.meals?.[0] || null;
  } catch (error) {
    console.error("Error loading recipe:", error);
    return null;
  }
}

//security html

//Escapes text before inserting it into HTML.

function escapeHTML(value = "") {
  const element = document.createElement("div");

  element.textContent = value;

  return element.innerHTML;
}

//LOCALSTORAGE...
// Load favorites from localStorage

function getFavorites() {
  try {
    const storedFavorites = localStorage.getItem(FAVORITES_KEY);

    if (!storedFavorites) {
      return [];
    }

    const favorites = JSON.parse(storedFavorites);

    return Array.isArray(favorites) ? favorites : [];
  } catch (error) {
    console.error("Unable to load favorite recipes:", error);

    return [];
  }
}

//Saves favorite recipes to localStorage

function saveFavorites(favorites) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error("Unable to save favorite recipes:", error);
  }
}

// Check if recipe is in favorites

function isFavorite(recipeId) {
  return getFavorites().some((recipe) => recipe.idMeal === recipeId);
}

// adds or removes a recipe from favorites

function toggleFavorite(recipe) {
  const favorites = getFavorites();

  const existingIndex = favorites.findIndex(
    (favorite) => favorite.idMeal === recipe.idMeal,
  );

  if (existingIndex !== -1) {
    favorites.splice(existingIndex, 1);
  } else {
    favorites.push(recipe);
  }

  saveFavorites(favorites);

  renderFavorites();

  // refresh favorite status in current search results

  updateFavoriteButtons(recipe.idMeal);
}

//updates all favorite buttons associated with a recipe

function updateFavoriteButtons(recipeId) {
  const buttons = document.querySelectorAll(`[data-favorite-id="${recipeId}"]`);

  const favorite = isFavorite(recipeId);

  buttons.forEach((button) => {
    button.classList.toggle("is-favorite", favorite);

    button.textContent = favorite ? "♥" : "♡";

    button.setAttribute("aria-pressed", String(favorite));

    button.setAttribute(
      "aria-label",
      favorite ? "Remove recipe from favorites" : "Add recipe to favorites",
    );
  });
}

//Recipe card...

//Creates a recipe card

function createRecipeCard(recipe) {
  const card = document.createElement("article");

  card.className = "recipe-card";

  const favorite = isFavorite(recipe.idMeal);

  card.innerHTML = `
    <div class="recipe-image-wrapper">
      <img
        class="recipe-image"
        src="${escapeHTML(recipe.strMealThumb)}"
        alt="${escapeHTML(recipe.strMeal)} recipe"
        loading="lazy"
      />

      <button
        type="button"
        class="favorite-button ${favorite ? "is-favorite" : ""}"
        data-favorite-id="${escapeHTML(recipe.idMeal)}"
        aria-label="${
          favorite ? "Remove recipe from favorites" : "Add recipe to favorites"
        }"
        aria-pressed="${favorite}"
        title="${favorite ? "Remove from favorites" : "Add to favorites"}"
      >
        ${favorite ? "♥" : "♡"}
      </button>
    </div>

    <div class="recipe-content">
      <h3>${escapeHTML(recipe.strMeal)}</h3>

      <div class="recipe-meta">
        <span>
          ${escapeHTML(recipe.strCategory || "Recipe")}
        </span>

        <span>
          ${escapeHTML(recipe.strArea || "International")}
        </span>
      </div>

      <button
        type="button"
        class="primary-button recipe-button"
        data-recipe-id="${escapeHTML(recipe.idMeal)}"
      >
        VIEW RECIPE
      </button>
    </div>
  `;

  return card;
}

//displays a loading message

function showLoading(container) {
  container.innerHTML = `
    <div class="loading">
      Loading recipes
    </div>
  `;
}

//displays an error message

function showError(container) {
  container.innerHTML = `
    <div class="error-message">
      <p>
        Unable to load recipes right now.
        Please try again.
      </p>
    </div>
  `;
}

//Displays a no-results message

function showNoResults(container) {
  container.innerHTML = `
    <div class="no-results">
      <p>
        No recipes were found.
        Try another search term.
      </p>
    </div>
  `;
}

//Renders recipe search results

function renderRecipes(recipes) {
  recipeList.innerHTML = "";

  if (!recipes.length) {
    showNoResults(recipeList);
    return;
  }

  const fragment = document.createDocumentFragment();

  recipes.forEach((recipe) => {
    fragment.appendChild(createRecipeCard(recipe));
  });

  recipeList.appendChild(fragment);
}

// saved favorite recipes

function renderFavorites() {
  const favorites = getFavorites();

  favoriteList.innerHTML = "";

  if (!favorites.length) {
    favoriteList.innerHTML = `
      <div class="no-results">
        <p>
          Your favorite recipes will appear here.
        </p>
      </div>
    `;

    return;
  }

  const fragment = document.createDocumentFragment();

  favorites.forEach((recipe) => {
    fragment.appendChild(createRecipeCard(recipe));
  });

  favoriteList.appendChild(fragment);
}

//Obtain TheMealDB recipe

function getIngredients(recipe) {
  const ingredients = [];

  for (let index = 1; index <= 20; index += 1) {
    const ingredient = recipe[`strIngredient${index}`];

    const measure = recipe[`strMeasure${index}`];

    if (ingredient && ingredient.trim()) {
      ingredients.push({
        ingredient: ingredient.trim(),
        measure: measure ? measure.trim() : "",
      });
    }
  }

  return ingredients;
}

// Creates the ingredient list HTML

function createIngredientList(recipe) {
  const ingredients = getIngredients(recipe);

  if (!ingredients.length) {
    return "<li>Ingredients not available.</li>";
  }

  return ingredients
    .map(
      ({ ingredient, measure }) => `
        <li>
          <strong>${escapeHTML(ingredient)}</strong>
          ${measure ? ` — ${escapeHTML(measure)}` : ""}
        </li>
      `,
    )
    .join("");
}

// Opens the recipe modal

function openRecipeModal(recipe) {
  if (!recipe) {
    return;
  }

  const ingredients = createIngredientList(recipe);

  recipeModalTitle.textContent = recipe.strMeal;

  recipeModalBody.innerHTML = `
    <img
      class="modal-image"
      src="${escapeHTML(recipe.strMealThumb)}"
      alt="${escapeHTML(recipe.strMeal)} recipe"
    />

    <div class="recipe-meta">
      <span>
        ${escapeHTML(recipe.strCategory || "Recipe")}
      </span>

      <span>
        ${escapeHTML(recipe.strArea || "International")}
      </span>
    </div>

    <h3>Ingredients</h3>

    <ul>
      ${ingredients}
    </ul>

    <h3>Instructions</h3>

    <p>
      ${escapeHTML(recipe.strInstructions || "Instructions are not available.")}
    </p>
  `;

  if (typeof recipeModal.showModal === "function") {
    recipeModal.showModal();
  } else {
    recipeModal.setAttribute("open", "");
  }
}

// Closes the recipe modal

function closeRecipeModal() {
  if (typeof recipeModal.close === "function") {
    recipeModal.close();
  } else {
    recipeModal.removeAttribute("open");
  }
}

//click event

async function handleRecipeListClick(event) {
  const favoriteButton = event.target.closest(".favorite-button");

  if (favoriteButton) {
    event.preventDefault();

    const recipeId = favoriteButton.dataset.favoriteId;

    if (!recipeId) {
      return;
    }

    //If recipe is in favorites, remove it.

    const favorites = getFavorites();

    const existingRecipe = favorites.find(
      (recipe) => recipe.idMeal === recipeId,
    );

    if (existingRecipe) {
      toggleFavorite(existingRecipe);
      return;
    }

    const recipe = await getRecipeById(recipeId);

    if (recipe) {
      toggleFavorite(recipe);
    }

    return;
  }

  const recipeButton = event.target.closest("[data-recipe-id]");

  if (!recipeButton) {
    return;
  }

  const recipeId = recipeButton.dataset.recipeId;

  if (!recipeId) {
    return;
  }

  const recipe = await getRecipeById(recipeId);

  if (recipe) {
    openRecipeModal(recipe);
  }
}

//search
async function handleSearch(event) {
  event.preventDefault();

  const query = searchInput.value.trim();

  if (!query) {
    searchInput.focus();
    return;
  }

  showLoading(recipeList);

  try {
    const recipes = await searchRecipes(query);

    renderRecipes(recipes);
  } catch (error) {
    showError(recipeList);
  }
}

//Modal events

function handleModalBackdropClick(event) {
  if (event.target === recipeModal) {
    closeRecipeModal();
  }
}

//Initialization nutrition module...

function initNutrition() {
  if (!searchForm || !searchInput || !recipeList || !favoriteList) {
    return;
  }

  searchForm.addEventListener("submit", handleSearch);

  recipeList.addEventListener("click", handleRecipeListClick);

  favoriteList.addEventListener("click", handleRecipeListClick);

  if (recipeModalClose) {
    recipeModalClose.addEventListener("click", closeRecipeModal);
  }

  if (recipeModal) {
    recipeModal.addEventListener("click", handleModalBackdropClick);
  }

  renderFavorites();

  //Initial recipe search to ensure the Nutrition page
  searchInput.value = "chicken";

  handleSearch(new Event("submit"));
}

export {
  initNutrition,
  searchRecipes,
  getRecipeById,
  getFavorites,
  toggleFavorite,
  renderFavorites,
  openRecipeModal,
  closeRecipeModal,
};
