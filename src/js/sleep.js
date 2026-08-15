const STORAGE_KEY = "sleepWellFitHistory";

//Dom elements here
const sleepForm = document.querySelector("#sleep-form");
const bedtimeInput = document.querySelector("#bedtime");
const wakeTimeInput = document.querySelector("#wake-time");
const sleepResult = document.querySelector("#sleep-result");
const sleepHoursOutput = document.querySelector("#sleep-hours");
const saveSleepButton = document.querySelector("#save-sleep");
const historyList = document.querySelector("#sleep-history-list");
const clearHistoryButton = document.querySelector("#clear-history");

let currentSleepRecord = null;

//LOCAL STORAGE

// Load full sleep history from localStorage

function getSleepHistory() {
  try {
    const storedHistory = localStorage.getItem(STORAGE_KEY);

    if (!storedHistory) {
      return [];
    }

    const history = JSON.parse(storedHistory);

    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error("Unable to read sleep history:", error);
    return [];
  }
}

//Saves the complete sleep history records

function setSleepHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Unable to save sleep history:", error);
  }
}

//SLEEP CALCULATION

// Convert h:m string to minutes since midnight

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

//Calculate sleep duration (handles overnight sleep)

function calculateSleepDuration(bedtime, wakeTime) {
  const bedtimeMinutes = timeToMinutes(bedtime);
  const wakeTimeMinutes = timeToMinutes(wakeTime);

  let totalMinutes = wakeTimeMinutes - bedtimeMinutes;

  // Sleep continued into the next day
  if (totalMinutes <= 0) {
    totalMinutes += 24 * 60;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    totalMinutes,
    hours,
    minutes,
  };
}

//Formats the calculated duration for display
//hours/minutes into readable sting

function formatDuration(hours, minutes) {
  const hourText = hours === 1 ? "hour" : "hours";
  const minuteText = minutes === 1 ? "min" : "mins";

  return `${hours} ${hourText} ${minutes} ${minuteText}`;
}

//Date - time formatting
// Converts a  H.M value to a 12-hour display format

function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

//Formats an ISO date for the history display

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

//sleep result
// Displays the calculated sleep duration.

function displaySleepResult(duration) {
  sleepHoursOutput.textContent = formatDuration(
    duration.hours,
    duration.minutes,
  );

  sleepResult.classList.add("has-result");
  saveSleepButton.disabled = false;
}

//Resets the calculation result

function resetSleepResult() {
  currentSleepRecord = null;

  sleepHoursOutput.textContent = "-- hours";
  saveSleepButton.disabled = true;
}

//Displays the empty history state

function displayEmptyHistory() {
  historyList.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon" aria-hidden="true">
        ☾
      </div>

      <p>
        No sleep records yet.
      </p>
    </div>
  `;
}

//Creates the HTML for one sleep history record

function createHistoryItem(record) {
  const item = document.createElement("article");

  item.className = "sleep-history-item";
  item.dataset.id = record.id;

  item.innerHTML = `
    <div class="sleep-history-data">
      <div>
        <strong>Date:</strong>
        <span>${formatDate(record.date)}</span>
      </div>

      <div>
        <strong>Bedtime:</strong>
        <span>${formatTime(record.bedtime)}</span>
      </div>

      <div>
        <strong>Wake up:</strong>
        <span>${formatTime(record.wakeTime)}</span>
      </div>

      <div>
        <strong>Hours Slept:</strong>
        <span>${formatDuration(record.hours, record.minutes)}</span>
      </div>
    </div>

    <button
      type="button"
      class="sleep-history-delete"
      data-id="${record.id}"
      aria-label="Delete sleep record from ${formatDate(record.date)}"
      title="Delete sleep record"
    >
      🗑
    </button>
  `;

  return item;
}

// Renders all saved sleep records

function renderSleepHistory() {
  const history = getSleepHistory();

  if (history.length === 0) {
    displayEmptyHistory();
    return;
  }

  historyList.innerHTML = "";

  history.forEach((record) => {
    const historyItem = createHistoryItem(record);
    historyList.appendChild(historyItem);
  });
}

//SAVE SLEEP
//Create and save the current sleep calculation

function saveSleepRecord() {
  if (!currentSleepRecord) {
    return;
  }

  const history = getSleepHistory();

  history.unshift(currentSleepRecord);

  setSleepHistory(history);

  renderSleepHistory();

  resetSleepResult();
}

//delete unique card

function deleteSleepRecord(recordId) {
  const history = getSleepHistory();

  const updatedHistory = history.filter((record) => record.id !== recordId);

  setSleepHistory(updatedHistory);

  renderSleepHistory();
}

//Clear all history

//Removes every saved sleep record

function clearAllHistory() {
  const history = getSleepHistory();

  if (history.length === 0) {
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to clear all sleep history?",
  );

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);

  renderSleepHistory();
}

//Handles the sleep calculation form

function handleSleepCalculation(event) {
  event.preventDefault();

  const bedtime = bedtimeInput.value;
  const wakeTime = wakeTimeInput.value;

  if (!bedtime || !wakeTime) {
    resetSleepResult();
    return;
  }

  const duration = calculateSleepDuration(bedtime, wakeTime);

  currentSleepRecord = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    bedtime,
    wakeTime,
    totalMinutes: duration.totalMinutes,
    hours: duration.hours,
    minutes: duration.minutes,
  };

  displaySleepResult(duration);
}

//Handles clicks on the history list

function handleHistoryClick(event) {
  const deleteButton = event.target.closest(".sleep-history-delete");

  if (!deleteButton) {
    return;
  }

  const recordId = deleteButton.dataset.id;

  if (recordId) {
    deleteSleepRecord(recordId);
  }
}

//INITIALIZATION

//Initializes the sleep tracker

function initSleep() {
  if (!sleepForm) {
    return;
  }

  sleepForm.addEventListener("submit", handleSleepCalculation);

  saveSleepButton.addEventListener("click", saveSleepRecord);

  historyList.addEventListener("click", handleHistoryClick);

  clearHistoryButton.addEventListener("click", clearAllHistory);

  renderSleepHistory();
}

export {
  initSleep,
  calculateSleepDuration,
  getSleepHistory,
  saveSleepRecord,
  deleteSleepRecord,
  clearAllHistory,
};
