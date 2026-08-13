/* =========================================================
   SLEEP WELL FIT
   Fitness Module - wger Exercise API
   ---------------------------------------------------------
   Responsibilities:
   - Connect to wger Exercise API
   - Load exercises
   - Filter exercises by muscle group
   - Render exercise cards
   - Display exercise details in a modal
   - Handle API loading and error states
   ========================================================= */

const API_URL = "https://wger.de/api/v2/exerciseinfo/?language=2&limit=100";

const MUSCLE_FILTERS = {
  chest: ["chest", "pectorals", "pectoralis"],
  back: ["back", "latissimus", "trapezius", "lats"],
  legs: [
    "legs",
    "leg",
    "quadriceps",
    "hamstrings",
    "calves",
    "gluteus",
    "glutes",
  ],
  arms: ["arms", "arm", "biceps", "triceps", "forearms"],
  shoulders: ["shoulders", "shoulder", "deltoid", "deltoids"],
  abs: ["abs", "abdominals", "abdominal", "rectus abdominis", "obliques"],
};


const exerciseList = document.querySelector("#exercise-list");

const exerciseModal = document.querySelector("#exercise-modal");

const exerciseModalBody = document.querySelector("#exercise-modal-body");

const exerciseModalTitle = document.querySelector("#exercise-modal-title");

const exerciseModalClose = document.querySelector("#exercise-modal-close");

//const filterButtons = document.querySelectorAll(".filter-button");

//Aplication state.

let allExercises = [];

let currentFilter = "chest";

//Security.
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

/**
 * Removes HTML tags from descriptions returned by
 * the wger API.
 *
 * @param {string} html - HTML description.
 * @returns {string} Plain text description.
 */
function stripHTML(html = "") {
  const element = document.createElement("div");

  element.innerHTML = html;

  return element.textContent.replace(/\s+/g, " ").trim();
}

/**
 * Creates a short description for exercise cards.
 *
 * @param {string} description - Exercise description.
 * @param {number} maxLength - Maximum number of characters.
 * @returns {string} Short description.
 */
function truncateText(description, maxLength = 150) {
  const text = stripHTML(description);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

//API

/**
 * Retrieves exercises from the wger API.
 *
 * @returns {Promise<Array>} Exercise results.
 */
async function fetchExercises() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`wger API request failed: ${response.status}`);
    }

    const data = await response.json();

    return Array.isArray(data.results) ? data.results : [];
  } catch (error) {
    console.error("Error loading exercises from wger:", error);

    throw error;
  }
}

//Exercise data helpers.

/**
 * Gets muscle names from a wger exercise.
 *
 * wger may return muscles as objects containing
 * a translated name, depending on the API response.
 *
 * @param {Object} exercise - wger exercise.
 * @returns {Array<string>} Muscle names.
 */
function getMuscleNames(exercise) {
  if (!Array.isArray(exercise.muscles)) {
    return [];
  }

  return exercise.muscles
    .map((muscle) => {
      if (typeof muscle === "string") {
        return muscle;
      }

      return muscle.name || muscle.name_en || "";
    })
    .filter(Boolean)
    .map((muscle) => muscle.toLowerCase().trim());
}

/**
 * Gets the category name from an exercise.
 *
 * @param {Object} exercise - wger exercise.
 * @returns {string} Category name.
 */
function getCategoryName(exercise) {
  if (!exercise.category) {
    return "General";
  }

  if (typeof exercise.category === "string") {
    return exercise.category;
  }

  return exercise.category.name || "General";
}

/**
 * Gets equipment names from an exercise.
 *
 * @param {Object} exercise - wger exercise.
 * @returns {Array<string>} Equipment names.
 */
function getEquipmentNames(exercise) {
  if (!Array.isArray(exercise.equipment)) {
    return [];
  }

  return exercise.equipment
    .map((equipment) => {
      if (typeof equipment === "string") {
        return equipment;
      }

      return equipment.name || equipment.name_en || "";
    })
    .filter(Boolean);
}

/**
 * Returns the best available exercise image.
 *
 * @param {Object} exercise - wger exercise.
 * @returns {string|null} Image URL.
 */
function getExerciseImage(exercise) {
  if (Array.isArray(exercise.images) && exercise.images.length > 0) {
    const image = exercise.images[0];

    if (typeof image === "string") {
      return image;
    }

    return image.image || image.image_thumbnail || null;
  }

  return null;
}

/**
 * Returns a readable muscle label.
 *
 * @param {Object} exercise - wger exercise.
 * @returns {string} Muscle label.
 */
function getMuscleLabel(exercise) {
  const muscles = getMuscleNames(exercise);

  if (muscles.length > 0) {
    return muscles
      .map((muscle) => {
        return muscle
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      })
      .join(", ");
  }

  return getCategoryName(exercise);
}


//Filtering

/**
 * Determines whether an exercise belongs to
 * the selected muscle group.
 *
 * @param {Object} exercise - wger exercise.
 * @param {string} muscleGroup - Selected muscle group.
 * @returns {boolean} Whether exercise matches.
 */
function matchesMuscle(exercise, muscleGroup) {
  const acceptedMuscles = MUSCLE_FILTERS[muscleGroup];

  if (!acceptedMuscles) {
    return true;
  }

  const muscles = getMuscleNames(exercise);

  return muscles.some((muscle) =>
    acceptedMuscles.some((accepted) => muscle.includes(accepted)),
  );
}

/**
 * Filters all loaded exercises.
 *
 * @param {string} muscleGroup - Muscle filter.
 * @returns {Array} Filtered exercises.
 */
function filterExercises(muscleGroup) {
  if (muscleGroup === "all") {
    return allExercises;
  }

  return allExercises.filter((exercise) =>
    matchesMuscle(exercise, muscleGroup),
  );
}

/**
 * Applies the selected filter and updates the UI.
 *
 * @param {string} muscleGroup - Selected muscle.
 */
function applyMuscleFilter(muscleGroup) {
  currentFilter = muscleGroup;

  const filteredExercises = filterExercises(muscleGroup);

  renderExercises(filteredExercises);

  updateFilterButtons(muscleGroup);
}

/**
 * Updates active filter button states.
 *
 * @param {string} activeFilter - Selected filter.
 */
//function updateFilterButtons(activeFilter) {
  //filterButtons.forEach((button) => {
    //const isActive = button.dataset.muscle === activeFilter;

    //button.classList.toggle("active", isActive);

    //button.setAttribute("aria-pressed", String(isActive));
  //});
//}


//my code

function updateFilterButtons(activeFilter) {
  const filterButtons = document.querySelectorAll(".filter-button");

  filterButtons.forEach((button) => {
    const isActive = button.dataset.muscle === activeFilter;

    button.classList.toggle("active", isActive);

    button.setAttribute("aria-pressed", String(isActive));
  });
}

//exercise cards

/**
 * Creates an exercise card.
 *
 * @param {Object} exercise - wger exercise.
 * @returns {HTMLElement} Exercise card.
 */
function createExerciseCard(exercise) {
  const card = document.createElement("article");

  card.className = "exercise-card";

  const name = exercise.name || "Unnamed Exercise";
  
  const description = exercise.description || "";

  const muscle = getMuscleLabel(exercise);

  const equipment = getEquipmentNames(exercise);

  const category = getCategoryName(exercise);

  const image = getExerciseImage(exercise);

  const imageHTML = image
    ? `
      <img
        class="exercise-image"
        src="${escapeHTML(image)}"
        alt="${escapeHTML(name)} demonstration"
        loading="lazy"
      />
    `
    : `
      <div
        class="exercise-image exercise-image-placeholder"
        role="img"
        aria-label="Exercise image not available"
      >
        <span aria-hidden="true">🏋</span>
      </div>
    `;

  card.innerHTML = `
    ${imageHTML}

    <div class="exercise-info">
      <h3>
        ${escapeHTML(name)}
      </h3>

      <div class="exercise-meta">
        <span>
          <strong>Muscle:</strong>
          ${escapeHTML(muscle)}
        </span>

        <span>
          <strong>Equipment:</strong>
          ${
            equipment.length > 0
              ? escapeHTML(equipment.join(", "))
              : "Body Only"
          }
        </span>

        <span>
          <strong>Type:</strong>
          ${escapeHTML(category)}
        </span>
      </div>

      <p class="exercise-description">
        ${escapeHTML(truncateText(description))}
      </p>
    </div>

    <button
      type="button"
      class="primary-button exercise-details-button"
      data-exercise-id="${escapeHTML(String(exercise.id))}"
      aria-label="View details for ${escapeHTML(name)}"
    >
      VIEW DETAILS
    </button>
  `;

  return card;
}

/* =========================================================
   RENDER EXERCISES
   ========================================================= */

/**
 * Displays a loading state.
 */
function showLoading() {
  exerciseList.innerHTML = `
    <div class="loading">
      Loading exercises
    </div>
  `;
}

/**
 * Displays an API error.
 */
function showError() {
  exerciseList.innerHTML = `
    <div class="error-message">
      <p>
        Unable to load exercises right now.
        Please try again later.
      </p>
    </div>
  `;
}

/**
 * Displays a no-results message.
 */
function showNoExercises() {
  exerciseList.innerHTML = `
    <div class="no-results">
      <p>
        No exercises were found for this muscle group.
      </p>
    </div>
  `;
}

/**
 * Renders a list of exercises.
 *
 * @param {Array} exercises - Exercises to display.
 */
function renderExercises(exercises) {
  exerciseList.innerHTML = "";

  if (!exercises.length) {
    showNoExercises();
    return;
  }

  const fragment = document.createDocumentFragment();

  exercises.forEach((exercise) => {
    fragment.appendChild(createExerciseCard(exercise));
  });

  exerciseList.appendChild(fragment);
}

/* =========================================================
   EXERCISE DETAILS
   ========================================================= */

/**
 * Opens the exercise details modal.
 *
 * @param {Object} exercise - Exercise object.
 */
function openExerciseModal(exercise) {
  if (!exercise) {
    return;
  }

  const name = exercise.name || "Exercise Details";

  const description = stripHTML(
    exercise.description || "No description available.",
  );

  const muscle = getMuscleLabel(exercise);

  const equipment = getEquipmentNames(exercise);

  const category = getCategoryName(exercise);

  const image = getExerciseImage(exercise);

  exerciseModalTitle.textContent = name;

  exerciseModalBody.innerHTML = `
    ${
      image
        ? `
          <img
            class="modal-image"
            src="${escapeHTML(image)}"
            alt="${escapeHTML(name)} demonstration"
          />
        `
        : ""
    }

    <div class="exercise-meta">
      <span>
        <strong>Muscle:</strong>
        ${escapeHTML(muscle)}
      </span>

      <span>
        <strong>Equipment:</strong>
        ${equipment.length > 0 ? escapeHTML(equipment.join(", ")) : "Body Only"}
      </span>

      <span>
        <strong>Type:</strong>
        ${escapeHTML(category)}
      </span>
    </div>

    <h3>Description</h3>

    <p>
      ${escapeHTML(description)}
    </p>
  `;

  if (typeof exerciseModal.showModal === "function") {
    exerciseModal.showModal();
  } else {
    exerciseModal.setAttribute("open", "");
  }
}

/**
 * Closes the exercise details modal.
 */
function closeExerciseModal() {
  if (typeof exerciseModal.close === "function") {
    exerciseModal.close();
  } else {
    exerciseModal.removeAttribute("open");
  }
}

/* =========================================================
   EVENT HANDLERS
   ========================================================= */

/**
 * Handles muscle filter button clicks.
 *
 * @param {MouseEvent} event - Click event.
 */
function handleFilterClick(event) {
  const button = event.currentTarget;

  const muscle = button.dataset.muscle;

  if (!muscle) {
    return;
  }

  applyMuscleFilter(muscle);
}

/**
 * Handles exercise card clicks.
 *
 * Uses event delegation because cards are generated
 * dynamically from the API.
 *
 * @param {MouseEvent} event - Click event.
 */
function handleExerciseListClick(event) {
  const button = event.target.closest("[data-exercise-id]");

  if (!button) {
    return;
  }

  const exerciseId = Number(button.dataset.exerciseId);

  const exercise = allExercises.find((item) => Number(item.id) === exerciseId);

  if (exercise) {
    openExerciseModal(exercise);
  }
}

/**
 * Closes the modal when the user clicks
 * outside the modal content.
 *
 * @param {MouseEvent} event - Click event.
 */
function handleModalBackdropClick(event) {
  if (event.target === exerciseModal) {
    closeExerciseModal();
  }
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

/**
 * Initializes the Fitness module.
 *
 * The initial filter is Chest to match the
 * project wireframe.
 */
async function initFitness() {
  if (!exerciseList) {
    return;
  }

  showLoading();


   const filterButtons = document.querySelectorAll(".filter-button");

  filterButtons.forEach((button) => {
    button.addEventListener("click", handleFilterClick);
  });

  exerciseList.addEventListener("click", handleExerciseListClick);

  if (exerciseModalClose) {
    exerciseModalClose.addEventListener("click", closeExerciseModal);
  }

  if (exerciseModal) {
    exerciseModal.addEventListener("click", handleModalBackdropClick);
  }

  try {
    allExercises = await fetchExercises();

    /*
     * Start with Chest selected,
     * matching the wireframe.
     */
    applyMuscleFilter(currentFilter);
  } catch (error) {
    showError();
  }
}

/* =========================================================
   MODULE EXPORTS
   ========================================================= */

export {
  initFitness,
  fetchExercises,
  filterExercises,
  renderExercises,
  openExerciseModal,
  closeExerciseModal,
};
