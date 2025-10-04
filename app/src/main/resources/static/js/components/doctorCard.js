/* app/src/main/resources/static/js/components/doctorCard.js
   Reusable doctor card for Admin & Patient dashboards.

   - Named export: createDoctorCard(doctor)
   - Renders doctor info (name, specialty, email, availability)
   - Role-aware actions:
       admin         -> Delete
       patient       -> Book Now (prompts to login)
       loggedPatient -> Book Now (opens booking overlay)
*/

import { deleteDoctor } from "../services/doctorServices.js";
import { getPatientData } from "../services/patientServices.js";
// Adjust the import below to your project structure if needed.
// e.g., "../loggedPatient.js" or "../components/modals.js"
import { showBookingOverlay } from "../components/modals.js";

/**
 * Create a DOM element for a doctor's card.
 * @param {Object} doctor - { id, name, specialization, email, availability: string[] | string }
 * @returns {HTMLDivElement}
 */
export function createDoctorCard(doctor) {
  // Main card container
  const card = document.createElement("div");
  card.classList.add("doctor-card");
  card.setAttribute("data-id", doctor?.id ?? "");

  // Current user role
  const role = localStorage.getItem("userRole");

  // ---- Doctor Info ----
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("doctor-info");

  const name = document.createElement("h3");
  name.classList.add("name");
  name.textContent = doctor?.name || "Unnamed Doctor";

  const specialization = document.createElement("p");
  specialization.classList.add("specialty");
  specialization.textContent = doctor?.specialization
    ? `Specialty: ${doctor.specialization}`
    : "Specialty: —";

  const email = document.createElement("p");
  email.classList.add("email");
  email.textContent = doctor?.email ? `Email: ${doctor.email}` : "Email: —";

  const availability = document.createElement("p");
  availability.classList.add("availability");
  const slots = Array.isArray(doctor?.availability)
    ? doctor.availability
    : (doctor?.availability ? [doctor.availability] : []);
  availability.textContent =
    slots.length > 0 ? `Availability: ${slots.join(", ")}` : "Availability: —";

  infoDiv.appendChild(name);
  infoDiv.appendChild(specialization);
  infoDiv.appendChild(email);
  infoDiv.appendChild(availability);

  // ---- Actions ----
  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("card-actions");

  // ADMIN: Delete doctor
  if (role === "admin") {
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "action-btn btn-danger";
    removeBtn.textContent = "Delete";

    removeBtn.addEventListener("click", async () => {
      const ok = confirm(`Delete Dr. ${doctor?.name ?? ""}?`);
      if (!ok) return;

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Missing admin token. Please log in again.");
        window.location.href = "/";
        return;
      }

      try {
        const res = await deleteDoctor(doctor.id, token);
        if (res?.success) {
          card.remove();
          alert("Doctor removed successfully.");
        } else {
          alert(res?.message || "Failed to delete doctor.");
        }
      } catch (err) {
        console.error("Delete doctor error:", err);
        alert("An error occurred while deleting the doctor.");
      }
    });

    actionsDiv.appendChild(removeBtn);
  }
  // PATIENT (not logged in): prompt to log in
  else if (role === "patient") {
    const bookNow = document.createElement("button");
    bookNow.type = "button";
    bookNow.className = "action-btn";
    bookNow.textContent = "Book Now";

    bookNow.addEventListener("click", () => {
      alert("Please log in to book an appointment.");
      // Optional: open login modal if available
      if (typeof window.openModal === "function") {
        window.openModal("patientLogin");
      }
    });

    actionsDiv.appendChild(bookNow);
  }
  // LOGGED-IN PATIENT: open booking overlay
  else if (role === "loggedPatient") {
    const bookNow = document.createElement("button");
    bookNow.type = "button";
    bookNow.className = "action-btn";
    bookNow.textContent = "Book Now";

    bookNow.addEventListener("click", async (e) => {
      const token = localStorage.getItem("token");
      if (!token) {
        // downgrade role & prompt to login again
        localStorage.setItem("userRole", "patient");
        alert("Session expired. Please log in again.");
        if (typeof window.openModal === "function") window.openModal("patientLogin");
        return;
      }
      try {
        const patientData = await getPatientData(token);
        showBookingOverlay(e, doctor, patientData);
      } catch (err) {
        console.error("Booking overlay error:", err);
        alert("Unable to start booking. Please try again.");
      }
    });

    actionsDiv.appendChild(bookNow);
  }
  // Other roles (doctor/unknown): no actions or add a placeholder if desired
  else {
    // (Optional) Add a subtle note or leave empty
  }

  // ---- Assemble card ----
  card.appendChild(infoDiv);
  card.appendChild(actionsDiv);

  return card;
}
