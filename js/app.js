// ABC Tutoring prototype — rendering, booking state, and PostHog instrumentation.
// Booking state is stored per-browser in localStorage, matching the assessment's
// guideline that GitHub Pages is static-only and client-side state is acceptable.

const BOOKINGS_KEY = "abc-tutoring-bookings";
const grid = document.getElementById("tutor-grid");
const filtersEl = document.getElementById("filters");
const modalOverlay = document.getElementById("modal-overlay");
const modalBody = document.getElementById("modal-body");

let activeSubject = "All";
let currentTutor = null;
let currentSlot = null;

function getLocalBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || [];
  } catch {
    return [];
  }
}

function markSlotBooked(slotId) {
  const bookings = getLocalBookings();
  bookings.push(slotId);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

function isSlotBooked(slot) {
  return slot.booked || getLocalBookings().includes(slot.id);
}

function track(event, props) {
  if (window.posthog) {
    window.posthog.capture(event, props);
  }
}

function renderFilters() {
  const subjects = ["All", ...ALL_SUBJECTS];
  filtersEl.innerHTML = subjects
    .map(
      (s) =>
        `<button class="filter-chip ${s === activeSubject ? "active" : ""}" data-subject="${s}">${s}</button>`
    )
    .join("");

  filtersEl.querySelectorAll(".filter-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeSubject = btn.dataset.subject;
      if (activeSubject !== "All") {
        track("subject_filter_used", { subject: activeSubject });
      }
      renderFilters();
      renderGrid();
    });
  });
}

function renderGrid() {
  const tutors =
    activeSubject === "All"
      ? TUTORS
      : TUTORS.filter((t) => t.subjects.includes(activeSubject));

  grid.innerHTML = tutors
    .map(
      (t) => `
    <div class="tutor-card">
      <img src="${t.photo}" alt="${t.name}" loading="lazy">
      <span class="subject-badge">${t.subjects.join(", ")}</span>
      <h3>${t.name}</h3>
      <div class="tutor-meta">${t.gradeLevels}</div>
      <div class="tutor-meta">${t.bio}</div>
      <div class="rate">$${t.hourlyRate}/hr</div>
      <button class="view-book-btn" data-id="${t.id}">View &amp; Book</button>
    </div>
  `
    )
    .join("");

  grid.querySelectorAll(".view-book-btn").forEach((btn) => {
    btn.addEventListener("click", () => openTutorModal(btn.dataset.id));
  });
}

function openTutorModal(tutorId) {
  currentTutor = TUTORS.find((t) => t.id === tutorId);
  currentSlot = null;
  track("tutor_viewed", {
    tutor: currentTutor.name,
    subject: currentTutor.subjects[0]
  });
  renderSlotStep();
  modalOverlay.hidden = false;
}

function closeModal() {
  modalOverlay.hidden = true;
  currentTutor = null;
  currentSlot = null;
}

function renderSlotStep() {
  const slotsHtml = currentTutor.slots
    .map((slot) => {
      const unavailable = isSlotBooked(slot);
      return `<div class="slot-option ${unavailable ? "unavailable" : ""}" data-slot="${slot.id}">
        <span>${slot.label}</span>
        <span>${unavailable ? "Booked" : "Select"}</span>
      </div>`;
    })
    .join("");

  modalBody.innerHTML = `
    <button class="modal-close" id="modal-close-btn" aria-label="Close">&times;</button>
    <h3>${currentTutor.name} &mdash; ${currentTutor.subjects[0]}</h3>
    <p class="tutor-meta">${currentTutor.gradeLevels} &middot; $${currentTutor.hourlyRate}/hr &middot; 1-hour sessions</p>
    <div class="slot-list">${slotsHtml}</div>
  `;

  document.getElementById("modal-close-btn").addEventListener("click", closeModal);
  modalBody.querySelectorAll(".slot-option:not(.unavailable)").forEach((el) => {
    el.addEventListener("click", () => {
      currentSlot = currentTutor.slots.find((s) => s.id === el.dataset.slot);
      track("booking_started", {
        tutor: currentTutor.name,
        subject: currentTutor.subjects[0],
        slot: currentSlot.label
      });
      renderFormStep();
    });
  });
}

function renderFormStep() {
  modalBody.innerHTML = `
    <button class="modal-close" id="modal-close-btn" aria-label="Close">&times;</button>
    <h3>Book ${currentTutor.name}</h3>
    <p class="tutor-meta">${currentSlot.label} &middot; ${currentTutor.subjects[0]}</p>
    <form class="booking-form" id="booking-form">
      <label for="parentName">Parent name</label>
      <input type="text" id="parentName" required>
      <label for="parentEmail">Parent email</label>
      <input type="email" id="parentEmail" required>
      <label for="studentName">Student first name</label>
      <input type="text" id="studentName" required>
      <label for="studentGrade">Student grade</label>
      <input type="text" id="studentGrade" required>
      <button type="submit" class="btn btn-primary" style="width:100%; margin-top:18px;">Confirm booking</button>
    </form>
  `;

  document.getElementById("modal-close-btn").addEventListener("click", closeModal);
  document.getElementById("booking-form").addEventListener("submit", (e) => {
    e.preventDefault();
    markSlotBooked(currentSlot.id);
    track("booking_completed", {
      tutor: currentTutor.name,
      subject: currentTutor.subjects[0],
      slot: currentSlot.label
    });
    renderConfirmationStep();
    renderGrid();
  });
}

function renderConfirmationStep() {
  modalBody.innerHTML = `
    <button class="modal-close" id="modal-close-btn" aria-label="Close">&times;</button>
    <div class="confirmation">
      <div class="check">&#9989;</div>
      <h3>You're booked!</h3>
      <p>${currentTutor.name} &middot; ${currentSlot.label}</p>
      <p class="tutor-meta">Dana will text you shortly to confirm the details.</p>
      <button class="btn btn-secondary" id="modal-done-btn" style="margin-top:14px;">Done</button>
    </div>
  `;
  document.getElementById("modal-close-btn").addEventListener("click", closeModal);
  document.getElementById("modal-done-btn").addEventListener("click", closeModal);
}

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.getElementById("browse-cta").addEventListener("click", () => {
  document.getElementById("tutors").scrollIntoView({ behavior: "smooth" });
});

renderFilters();
renderGrid();
