/* app/src/main/resources/static/js/adminDashboard.js
   Admin Dashboard logic: manage doctors (list, filter, add).
   - Uses modular services & components
   - Avoids fetch logic in UI layer
*/

import { openModal, closeModal } from "./components/modals.js";
import { getDoctors, filterDoctors, saveDoctor } from "./services/doctorServices.js";
import { createDoctorCard } from "./components/doctorCard.js";

/* -----------------------------------------------------------
   Bootstrapping / Event binding
----------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Add Doctor (from header)
  const addBtn = document.getElementById("addDocBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => openModal("addDoctor"));
  }

  // Wire filters
  const searchBar = document.getElementById("searchBar");
  const filterTime = document.getElementById("filterTime");
  const filterSpecialty = document.getElementById("filterSpecialty");

  if (searchBar) searchBar.addEventListener("input", filterDoctorsOnChange);
  if (filterTime) filterTime.addEventListener("change", filterDoctorsOnChange);
  if (filterSpecialty) filterSpecialty.addEventListener("change", filterDoctorsOnChange);

  // Initial load
  loadDoctorCards();
});

/* -----------------------------------------------------------
   Load and render all doctors
----------------------------------------------------------- */
async function loadDoctorCards() {
  try {
    const contentDiv = document.getElementById("content");
    if (!contentDiv) return;
    contentDiv.innerHTML = '<p class="text-center">Loading doctors…</p>';

    const doctors = await getDoctors();
    renderDoctorCards(doctors);
  } catch (err) {
    console.error("loadDoctorCards error:", err);
    const contentDiv = document.getElementById("content");
    if (contentDiv) {
      contentDiv.innerHTML = `<p class="noPatientRecord">Failed to load doctors. Please try again.</p>`;
    }
  }
}

/* -----------------------------------------------------------
   Filter doctors from controls
----------------------------------------------------------- */
async function filterDoctorsOnChange() {
  try {
    const name = (document.getElementById("searchBar")?.value || "").trim() || null;
    const time = (document.getElementById("filterTime")?.value || "").trim() || null;
    const specialty = (document.getElementById("filterSpecialty")?.value || "").trim() || null;

    const contentDiv = document.getElementById("content");
    if (contentDiv) contentDiv.innerHTML = '<p class="text-center">Filtering…</p>';

    const doctors = await filterDoctors(name, time, specialty);
    if (!doctors || doctors.length === 0) {
      if (contentDiv) {
        contentDiv.innerHTML = `<p class="noPatientRecord">No doctors found with the given filters.</p>`;
      }
      return;
    }
    renderDoctorCards(doctors);
  } catch (err) {
    console.error("filterDoctorsOnChange error:", err);
    alert("Something went wrong while filtering. Please try again.");
  }
}

/* -----------------------------------------------------------
   Helper: render a list of doctor cards
----------------------------------------------------------- */
function renderDoctorCards(doctors = []) {
  const contentDiv = document.getElementById("content");
  if (!contentDiv) return;

  contentDiv.innerHTML = "";
  if (!Array.isArray(doctors) || doctors.length === 0) {
    contentDiv.innerHTML = `<p class="noPatientRecord">No doctors found.</p>`;
    return;
  }

  for (const doc of doctors) {
    const card = createDoctorCard(doc);
    contentDiv.appendChild(card);
  }
}

/* -----------------------------------------------------------
   Add Doctor (modal submit handler)
   - Collects form data
   - Requires admin token
   - Calls saveDoctor() and refreshes list on success
----------------------------------------------------------- */
async function adminAddDoctor() {
  // Retrieve form fields (support a couple of common ids/names)
  const $ = (sel) => document.querySelector(sel);

  const name =
    $("#doc-name")?.value?.trim() ||
    $("#doctor-name")?.value?.trim() ||
    "";

  const email =
    $("#doc-email")?.value?.trim() ||
    $("#doctor-email")?.value?.trim() ||
    "";

  const password =
    $("#doc-password")?.value?.trim() ||
    $("#doctor-password")?.value?.trim() ||
    "";

  const phone =
    $("#doc-phone")?.value?.trim() ||
    $("#doctor-phone")?.value?.trim() ||
    "";

  const specialization =
    $("#doc-specialty")?.value?.trim() ||
    $("#doctor-specialty")?.value?.trim() ||
    $("#specialization")?.value?.trim() ||
    "";

  // Availability via checkboxes or text
  let availability = [];
  const checks = document.querySelectorAll('input[name="availability"]:checked');
  if (checks && checks.length) {
    availability = Array.from(checks).map((c) => c.value);
  } else {
    const availText = $("#doc-availability")?.value?.trim() || "";
    if (availText) {
      availability = availText.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  // Basic validation
  if (!name || !email || !password || !specialization) {
    alert("Please fill in name, email, password, and specialty.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Admin session missing or expired. Please log in again.");
    window.location.href = "/";
    return;
  }

  const doctorPayload = {
    name,
    email,
    password,
    phone,
    specialization,
    availability,
  };

  try {
    const res = await saveDoctor(doctorPayload, token);
    if (res?.success) {
      alert(res?.message || "Doctor added successfully.");
      if (typeof closeModal === "function") closeModal();
      // Reload list without a full page reload
      await loadDoctorCards();
      // Optionally reset form fields
      resetAddDoctorForm();
    } else {
      alert(res?.message || "Failed to add doctor.");
    }
  } catch (err) {
    console.error("adminAddDoctor error:", err);
    alert("Something went wrong while adding the doctor.");
  }
}

function resetAddDoctorForm() {
  const fields = [
    "#doc-name",
    "#doctor-name",
    "#doc-email",
    "#doctor-email",
    "#doc-password",
    "#doctor-password",
    "#doc-phone",
    "#doctor-phone",
    "#doc-specialty",
    "#doctor-specialty",
    "#doc-availability",
  ];
  fields.forEach((sel) => {
    const el = document.querySelector(sel);
    if (el) el.value = "";
  });
  const checks = document.querySelectorAll('input[name="availability"]:checked');
  checks.forEach((c) => (c.checked = false));
}

/* -----------------------------------------------------------
   Expose needed handlers for modal form buttons
----------------------------------------------------------- */
window.adminAddDoctor = adminAddDoctor;
