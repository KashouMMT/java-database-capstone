/* app/src/main/resources/static/js/services/patientServices.js
   Centralized Patient API services.
   - No hardcoded URLs (uses API_BASE_URL)
   - Clear, consistent return shapes
   - try/catch around all network calls
*/

import { API_BASE_URL } from "../config/config.js";

const PATIENT_API = API_BASE_URL + "/patient";

/* ---------------------------
   Helpers
---------------------------- */
const ok = (data = null, message = "OK") => ({ success: true, message, data });
const fail = (message = "Request failed", data = null) => ({ success: false, message, data });

/**
 * patientSignup
 * Create a patient account.
 * @param {Object} data - { name, email, password, ... }
 * @returns {{success:boolean, message:string}}
 */
export async function patientSignup(data) {
  try {
    const res = await fetch(`${PATIENT_API}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      return fail(result?.message || `Signup failed (HTTP ${res.status})`);
    }
    return ok(null, result?.message || "Signup successful.");
  } catch (error) {
    console.error("patientSignup error:", error);
    return fail("Something went wrong while signing up.");
  }
}

/**
 * patientLogin
 * Authenticate a patient.
 * NOTE: Returns the raw fetch Response so caller can inspect status, parse token, etc.
 * @param {Object} data - { email, password }
 * @returns {Response}
 */
export async function patientLogin(data) {
  // Dev aid; remove in production
  console.log("patientLogin :: ", data);
  return fetch(`${PATIENT_API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/**
 * getPatientData
 * Fetch the logged-in patient's profile by token.
 * @param {string} token
 * @returns {Object|null} patient or null on failure
 */
export async function getPatientData(token) {
  try {
    const res = await fetch(`${PATIENT_API}/${encodeURIComponent(token)}`, {
      method: "GET",
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return data?.patient ?? null;
    return null;
  } catch (error) {
    console.error("getPatientData error:", error);
    return null;
  }
}

/**
 * getPatientAppointments
 * Shared endpoint for both dashboards (role handled server-side).
 * @param {string|number} id - patient id
 * @param {string} token
 * @param {"patient"|"doctor"} user
 * @returns {Array|null} appointments array or null on failure
 */
export async function getPatientAppointments(id, token, user) {
  try {
    const url = `${PATIENT_API}/${encodeURIComponent(id)}/${encodeURIComponent(user)}/${encodeURIComponent(token)}`;
    const res = await fetch(url, { method: "GET" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return Array.isArray(data?.appointments) ? data.appointments : [];
    return null;
  } catch (error) {
    console.error("getPatientAppointments error:", error);
    return null;
  }
}

/**
 * filterAppointments
 * Filter appointments by condition and patient name.
 * @param {string} condition - e.g., "pending", "consulted"
 * @param {string} name
 * @param {string} token
 * @returns {{appointments:Array}} always returns an object with appointments array
 */
export async function filterAppointments(condition, name, token) {
  try {
    const c = condition?.trim() ? encodeURIComponent(condition.trim()) : "null";
    const n = name?.trim() ? encodeURIComponent(name.trim()) : "null";
    const t = encodeURIComponent(token ?? "");

    const res = await fetch(`${PATIENT_API}/filter/${c}/${n}/${t}`, { method: "GET" });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      // Normalize to consistent shape
      if (Array.isArray(data?.appointments)) return { appointments: data.appointments };
      if (Array.isArray(data)) return { appointments: data };
      return { appointments: [] };
    } else {
      console.error("filterAppointments failed:", res.status, res.statusText);
      return { appointments: [] };
    }
  } catch (error) {
    console.error("filterAppointments error:", error);
    alert("Something went wrong!");
    return { appointments: [] };
  }
}
