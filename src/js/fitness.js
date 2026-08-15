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

//Aplication state.

let allExercises = [];

let currentFilter = "chest";

//Security.

function escapeHTML(value = "") {
  const element = document.createElement("div");

  element.textContent = value;

  return element.innerHTML;
}

//Removes HTML tags from descriptions returned by the wger API

function stripHTML(html = "") {
  const element = document.createElement("div");

  element.innerHTML = html;

  return element.textContent.replace(/\s+/g, " ").trim();
}

// description for exercise cards

function truncateText(description, maxLength = 150) {
  const text = stripHTML(description);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

//API

//get exercises from the wger API

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
// Gets muscle names from a wger exercise

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

// category name from an exercise.

function getCategoryName(exercise) {
  if (!exercise.category) {
    return "General";
  }

  if (typeof exercise.category === "string") {
    return exercise.category;
  }

  return exercise.category.name || "General";
}

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

function getExerciseImage(exercise) {
  if (!Array.isArray(exercise.images) || exercise.images.length === 0) {
    return null;
  }

  const image = exercise.images[0];

  if (typeof image === "string") {
    return image;
  }

  return image.image || image.image_thumbnail || null;
}

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
//whether an exercise belongs to the selected muscle group

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

//Filters all loaded exercises

function filterExercises(muscleGroup) {
  if (muscleGroup === "all") {
    return allExercises;
  }

  return allExercises.filter((exercise) =>
    matchesMuscle(exercise, muscleGroup),
  );
}

//elected filter and updates the UI.

function applyMuscleFilter(muscleGroup) {
  currentFilter = muscleGroup;

  const filteredExercises = filterExercises(muscleGroup);

  renderExercises(filteredExercises);

  updateFilterButtons(muscleGroup);
}

function updateFilterButtons(activeFilter) {
  const filterButtons = document.querySelectorAll(".filter-button");

  filterButtons.forEach((button) => {
    const isActive = button.dataset.muscle === activeFilter;

    button.classList.toggle("active", isActive);

    button.setAttribute("aria-pressed", String(isActive));
  });
}

//Creates exercise cards- wger API

// added new code
function getExerciseTranslation(exercise) {
  if (!Array.isArray(exercise.translations)) {
    return null;
  }

  return (
    exercise.translations.find(
      (translation) => Number(translation.language) === 2,
    ) ||
    exercise.translations[0] ||
    null
  );
}

function createExerciseCard(exercise) {
  // Do not display exercises without an image
  const image = getExerciseImage(exercise);

  if (!image) {
    return null;
  }

  const translation = getExerciseTranslation(exercise);

  const name = translation?.name || "Exercise";
  const description = translation?.description || "";
  const card = document.createElement("article");

  card.className = "exercise-card";

  const muscle = getMuscleLabel(exercise);
  const equipment = getEquipmentNames(exercise);
  const category = getCategoryName(exercise);

  const imageHTML = `
    <img
      class="exercise-image"
      src="${escapeHTML(image)}"
      alt="${escapeHTML(name)} demonstration"
      loading="lazy"
    />
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
          ${equipment.length > 0
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

//Displays a loading state

function showLoading() {
  exerciseList.innerHTML = `
    <div class="loading">
      Loading exercises
    </div>
  `;
}

//Displays an API error

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

//Displays a no-results message
function showNoExercises() {
  exerciseList.innerHTML = `
    <div class="no-results">
      <p>
        No exercises were found for this muscle group.
      </p>
    </div>
  `;
}

// list of exercises

function renderExercises(exercises) {
  exerciseList.innerHTML = "";

  if (!exercises.length) {
    showNoExercises();
    return;
  }

  const fragment = document.createDocumentFragment();

  exercises.forEach((exercise) => {
    //new script
    const card = createExerciseCard(exercise);

    if (card) {
      fragment.appendChild(card);
    }
  });

  exerciseList.appendChild(fragment);
}

//exercise details...

//Opens the exercise details modal
function openExerciseModal(exercise) {
  if (!exercise) {
    return;
  }

  const translation = getExerciseTranslation(exercise);

  const name = translation?.name || "Exercise Details";

  const description = stripHTML(
    translation?.description || "No description available.",
  );

  const muscle = getMuscleLabel(exercise);

  const equipment = getEquipmentNames(exercise);

  const category = getCategoryName(exercise);

  const image = getExerciseImage(exercise);

  exerciseModalTitle.textContent = name;

  exerciseModalBody.innerHTML = `
    ${image
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

//Closes the exercise details modal
function closeExerciseModal() {
  if (typeof exerciseModal.close === "function") {
    exerciseModal.close();
  } else {
    exerciseModal.removeAttribute("open");
  }
}

//EVENT HANDLERS...

//Handles muscle filter button clicks

function handleFilterClick(event) {
  const button = event.currentTarget;

  const muscle = button.dataset.muscle;

  if (!muscle) {
    return;
  }

  applyMuscleFilter(muscle);
}

//Handles exercise card clicks

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

//Closes the modal when the user clicks  outside the modal content

function handleModalBackdropClick(event) {
  if (event.target === exerciseModal) {
    closeExerciseModal();
  }
}

//INITIALIZATION FITNESS MODULE...

//The initial filter is Chest to match the project

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

    //Start with Chest selected

    applyMuscleFilter(currentFilter);
  } catch (error) {
    showError();
  }
}

export {
  initFitness,
  fetchExercises,
  filterExercises,
  renderExercises,
  openExerciseModal,
  closeExerciseModal,
};
