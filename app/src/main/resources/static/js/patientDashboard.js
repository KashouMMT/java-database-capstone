/* app/src/main/resources/static/js/patientDashboard.js
   Patient Dashboard – View & Filter Doctors, Patient Auth (signup/login)

   - Renders doctor cards on load
   - Opens Login / Signup modals
   - Filters by name, time (AM/PM), and specialty
   - Handles patient signup & login flows

   Dependencies:
     ./components/doctorCard.js       -> createDoctorCard
     ./components/modals.js           -> openModal (and modal markup present in HTML)
     ./services/doctorServices.js     -> getDoctors, filterDoctors
     ./services/patientServices.js    -> patientSignup, patientLogin
*/

import { createDoctorCard } from "./components/doctorCard.js";
import { openModal } from "./components/modals.js";
import { getDoctors, filterDoctors } from "./services/doctorServices.js";
import { patientSignup, patientLogin } from "./services/patientServices.js";

/* -----------------------------------------------------------
   Initial load
----------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Render all doctors
  loadDoctorCards();

  // Bind modal triggers (header buttons get injected dynamically)
  const signupBtn = document.getElementById("patientSignup");
  if (signupBtn) signupBtn.addEventListener("click", () => openModal("patientSignup"));

  const loginBtn = document.getElementById("patientLogin");
  if (loginBtn) loginBtn.addEventListener("click", () => openModal("patientLogin"));

  // Bind filters (guard elements in case not present on some pages)
  const searchEl = document.getElementById("searchBar");
  const timeEl = document.getElementById("filterTime");
  const specEl = document.getElementById("filterSpecialty");

  if (searchEl) searchEl.addEventListener("input", filterDoctorsOnChange);
  if (timeEl) timeEl.addEventListener("change", filterDoctorsOnChange);
  if (specEl) specEl.addEventListener("change", filterDoctorsOnChange);
});

/* -----------------------------------------------------------
   Load & render all doctors
----------------------------------------------------------- */
async function loadDoctorCards() {
  const contentDiv = document.getElementById("content");
  if (!contentDiv) return;

  try {
    contentDiv.innerHTML = `<p class="text-center">Loading doctors…</p>`;
    const doctors = await getDoctors();

    renderDoctorCards(doctors);
  } catch (error) {
    console.error("Failed to load doctors:", error);
    contentDiv.innerHTML = `<p class="noPatientRecord">Failed to load doctors. Please try again.</p>`;
  }
}

/* -----------------------------------------------------------
   Filter logic (name, time, specialty)
----------------------------------------------------------- */
async function filterDoctorsOnChange() {
  const contentDiv = document.getElementById("content");
  if (!contentDiv) return;

  const nameInput = document.getElementById("searchBar");
  const timeInput = document.getElementById("filterTime");
  const specInput = document.getElementById("filterSpecialty");

  const name = nameInput?.value?.trim() ? nameInput.value.trim() : null;
  const time = timeInput?.value ? timeInput.value : null;
  const specialty = specInput?.value ? specInput.value : null;

  try {
    contentDiv.innerHTML = `<p class="text-center">Filtering…</p>`;

    // Our service returns an array (per service implementation), but
    // handle { doctors: [...] } too for safety.
    const result = await filterDoctors(name, time, specialty);
    const doctors = Array.isArray(result)
      ? result
      : (Array.isArray(result?.doctors) ? result.doctors : []);

    if (doctors.length === 0) {
      contentDiv.innerHTML = `<p class="noPatientRecord">No doctors found with the given filters.</p>`;
      return;
    }

    renderDoctorCards(doctors);
  } catch (error) {
    console.error("Failed to filter doctors:", error);
    alert("❌ An error occurred while filtering doctors.");
  }
}

/* -----------------------------------------------------------
   Render utility
----------------------------------------------------------- */
function renderDoctorCards(doctors = []) {
  const contentDiv = document.getElementById("content");
  if (!contentDiv) return;

  contentDiv.innerHTML = "";

  if (!Array.isArray(doctors) || doctors.length === 0) {
    contentDiv.innerHTML = `<p class="noPatientRecord">No doctors found.</p>`;
    return;
  }

  for (const doctor of doctors) {
    const card = createDoctorCard(doctor);
    contentDiv.appendChild(card);
  }
}

/* -----------------------------------------------------------
   Patient signup & login (exposed globally for modal forms)
----------------------------------------------------------- */
window.signupPatient = async function () {
  try {
    const name = document.getElementById("name")?.value?.trim();
    const email = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value?.trim();
    const phone = document.getElementById("phone")?.value?.trim();
    const address = document.getElementById("address")?.value?.trim();

    const data = { name, email, password, phone, address };

    const { success, message } = await patientSignup(data);
    if (success) {
      alert(message || "Signup successful!");
      // Close modal if present
      const modal = document.getElementById("modal");
      if (modal) modal.style.display = "none";
      window.location.reload();
    } else {
      alert(message || "Signup failed.");
    }
  } catch (error) {
    console.error("Signup failed:", error);
    alert("❌ An error occurred while signing up.");
  }
};

window.loginPatient = async function () {
  try {
    const email = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value?.trim();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    const response = await patientLogin({ email, password });

    if (response.ok) {
      const result = await response.json();
      // Persist role + token and route to logged-in view
      if (typeof window.selectRole === "function") {
        window.selectRole("loggedPatient");
      } else {
        localStorage.setItem("userRole", "loggedPatient");
      }
      localStorage.setItem("token", result?.token || result?.accessToken || "");
      window.location.href = "/pages/loggedPatientDashboard.html";
    } else {
      alert("❌ Invalid credentials!");
    }
  } catch (error) {
    console.log("Error :: loginPatient :: ", error);
    alert("❌ Failed to Login.");
  }
};
