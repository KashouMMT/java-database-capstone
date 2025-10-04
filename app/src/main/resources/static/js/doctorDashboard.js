/* app/src/main/resources/static/js/doctorDashboard.js
   Doctor Dashboard – Manage Appointments
   - Fetch & render today's appointments (or by selected date)
   - Filter by patient name
   - Uses modular services/components
*/

import { getAllAppointments } from "./services/appointmentRecordService.js";
import { createPatientRow } from "./components/patientRows.js";

/* -----------------------------------------------------------
   Globals / Element refs
----------------------------------------------------------- */

// Table body where rows will be rendered
let tableBody;

// Selected date (YYYY-MM-DD)
let selectedDate = toYMD(new Date());

// Auth token (doctor)
let token = localStorage.getItem("token") || "";

// Patient name filter (string | "null")
let patientName = "null";

/* -----------------------------------------------------------
   Utilities
----------------------------------------------------------- */
function toYMD(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function setDatePickerValue(dateStr) {
  const datePicker = document.getElementById("datePicker");
  if (datePicker) datePicker.value = dateStr;
}

function setLoadingRow(text = "Loading…") {
  if (!tableBody) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align:center;">${text}</td>
    </tr>`;
}

function setMessageRow(text) {
  if (!tableBody) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align:center;">${text}</td>
    </tr>`;
}

/* -----------------------------------------------------------
   Core: Load & render appointments
----------------------------------------------------------- */
async function loadAppointments() {
  if (!tableBody) return;

  // Guard: doctor must be logged in
  if (!token) {
    setMessageRow("You are not logged in. Please log in again.");
    return;
  }

  try {
    setLoadingRow("Loading appointments…");

    // Fetch list from backend (shared for patient/doctor; backend uses token)
    const appointments = await getAllAppointments(selectedDate, patientName, token);

    // Clear previous rows
    tableBody.innerHTML = "";

    // Handle empty state
    if (!Array.isArray(appointments) || appointments.length === 0) {
      setMessageRow("No Appointments found for today.");
      return;
    }

    // Render each appointment row
    for (const appt of appointments) {
      // appt is expected to include patient details (backend contract)
      // The createPatientRow component builds a <tr> element.
      const row = createPatientRow(appt);
      tableBody.appendChild(row);
    }
  } catch (err) {
    console.error("loadAppointments error:", err);
    setMessageRow("Error loading appointments. Try again later.");
  }
}

/* -----------------------------------------------------------
   Event wiring
----------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Cache elements
  tableBody = document.getElementById("patientTableBody");

  // Search bar
  const searchBar = document.getElementById("searchBar");
  if (searchBar) {
    searchBar.addEventListener("input", (e) => {
      const val = (e.target.value || "").trim();
      patientName = val ? val : "null";
      loadAppointments();
    });
  }

  // Today button
  const todayBtn = document.getElementById("todayButton");
  if (todayBtn) {
    todayBtn.addEventListener("click", () => {
      selectedDate = toYMD(new Date());
      setDatePickerValue(selectedDate);
      loadAppointments();
    });
  }

  // Date picker
  const datePicker = document.getElementById("datePicker");
  if (datePicker) {
    // Initialize to today's date if empty
    if (!datePicker.value) setDatePickerValue(selectedDate);

    datePicker.addEventListener("change", (e) => {
      const val = (e.target.value || "").trim();
      // Basic validation; if invalid, keep previous
      selectedDate = val || selectedDate;
      loadAppointments();
    });
  }

  // Optional: if your app uses renderContent to layout the page
  if (typeof window.renderContent === "function") {
    try {
      window.renderContent();
    } catch (_) {
      /* ignore */
    }
  }

  // Initial fetch
  loadAppointments();
});
