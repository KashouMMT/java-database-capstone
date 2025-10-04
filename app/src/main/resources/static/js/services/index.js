/* app/src/main/resources/static/js/services/index.js
   Role-based login handlers for the landing page.
   - Wires Admin/Doctor login buttons to open modals
   - Submits credentials to backend
   - Stores token, sets role via selectRole()
*/

import { openModal } from "../components/modals.js";
import { API_BASE_URL } from "../config/config.js";

// ---- API endpoints ----
const ADMIN_API  = API_BASE_URL + "/admin";
const DOCTOR_API = API_BASE_URL + "/doctor/login";

// Small helper to normalize token shapes from backend
function extractToken(payload) {
  // Common keys: token, accessToken, jwt, data.token
  return (
    payload?.token ||
    payload?.accessToken ||
    payload?.jwt ||
    payload?.data?.token ||
    null
  );
}

// Ensure DOM is ready before wiring buttons
window.onload = function () {
  const adminBtn  = document.getElementById("adminLogin");
  const doctorBtn = document.getElementById("doctorLogin");

  if (adminBtn) {
    adminBtn.addEventListener("click", () => openModal("adminLogin"));
  }
  if (doctorBtn) {
    doctorBtn.addEventListener("click", () => openModal("doctorLogin"));
  }
};

/**
 * Admin login submit handler
 * Reads #admin-username and #admin-password from the modal
 * Sends POST -> ADMIN_API
 * On success: save token, selectRole('admin')
 */
async function adminLoginHandler() {
  try {
    const usernameEl = document.getElementById("admin-username");
    const passwordEl = document.getElementById("admin-password");

    const username = usernameEl?.value?.trim() ?? "";
    const password = passwordEl?.value?.trim() ?? "";

    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    const admin = { username, password };

    const res = await fetch(ADMIN_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(admin),
    });

    if (!res.ok) {
      alert("Invalid credentials!");
      return;
    }

    const data = await res.json();
    const token = extractToken(data);

    if (!token) {
      console.error("Login response did not include a token:", data);
      alert("Login failed: missing token.");
      return;
    }

    localStorage.setItem("token", token);
    if (typeof window.selectRole === "function") {
      window.selectRole("admin"); // sets userRole and routes accordingly
    } else {
      localStorage.setItem("userRole", "admin");
      window.location.href = "/admin/adminDashboard";
    }

    if (typeof window.closeModal === "function") window.closeModal();
  } catch (err) {
    console.error("Admin login error:", err);
    alert("Something went wrong. Please try again.");
  }
}

/**
 * Doctor login submit handler
 * Reads #doctor-email and #doctor-password from the modal
 * Sends POST -> DOCTOR_API
 * On success: save token, selectRole('doctor')
 */
async function doctorLoginHandler() {
  try {
    const emailEl    = document.getElementById("doctor-email");
    const passwordEl = document.getElementById("doctor-password");

    const email    = emailEl?.value?.trim() ?? "";
    const password = passwordEl?.value?.trim() ?? "";

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    const doctor = { email, password };

    const res = await fetch(DOCTOR_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doctor),
    });

    if (!res.ok) {
      alert("Invalid credentials!");
      return;
    }

    const data = await res.json();
    const token = extractToken(data);

    if (!token) {
      console.error("Login response did not include a token:", data);
      alert("Login failed: missing token.");
      return;
    }

    localStorage.setItem("token", token);
    if (typeof window.selectRole === "function") {
      window.selectRole("doctor"); // sets userRole and routes accordingly
    } else {
      localStorage.setItem("userRole", "doctor");
      window.location.href = "/doctor/doctorDashboard";
    }

    if (typeof window.closeModal === "function") window.closeModal();
  } catch (err) {
    console.error("Doctor login error:", err);
    alert("Something went wrong. Please try again.");
  }
}

// Expose handlers globally so modal forms can call them via onsubmit / onclick
window.adminLoginHandler = adminLoginHandler;
window.doctorLoginHandler = doctorLoginHandler;

// Export endpoints (optional, in case other modules want them)
export { ADMIN_API, DOCTOR_API };
