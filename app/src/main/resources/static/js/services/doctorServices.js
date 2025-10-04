/* app/src/main/resources/static/js/services/doctorServices.js
   Service layer for Doctor-related API calls.
   - Centralizes fetch logic
   - Uses API_BASE_URL (no hardcoded URLs)
   - Returns consistent shapes to simplify UI code
*/

import { API_BASE_URL } from "../config/config.js";

const DOCTOR_API = API_BASE_URL + "/doctor";

/* -----------------------------------------------------------
   Helpers
----------------------------------------------------------- */
function ok(data, message = "OK") {
  return { success: true, message, data };
}
function fail(message = "Request failed", data = null) {
  return { success: false, message, data };
}

/* -----------------------------------------------------------
   Fetch all doctors
   Returns: Array<Doctor> (empty array on failure)
----------------------------------------------------------- */
export async function getDoctors() {
  try {
    const res = await fetch(DOCTOR_API, { method: "GET" });
    if (!res.ok) {
      console.error("getDoctors: HTTP", res.status);
      return [];
    }
    const payload = await res.json();
    // Accept common shapes: { doctors: [...] } or direct array
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.doctors)) return payload.doctors;
    return [];
  } catch (err) {
    console.error("getDoctors error:", err);
    return [];
  }
}

/* -----------------------------------------------------------
   Delete a doctor (Admin only)
   Params: id (string|number), token (string)
   Returns: { success, message }
   NOTE: Spec requests token in path; adjust if your backend uses headers.
----------------------------------------------------------- */
export async function deleteDoctor(id, token) {
  if (!id) return fail("Doctor ID is required.");
  if (!token) return fail("Missing authentication token.");

  const url = `${DOCTOR_API}/delete/${encodeURIComponent(id)}/${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data?.message || `Delete failed (HTTP ${res.status})`;
      return fail(msg);
    }
    return ok(null, data?.message || "Doctor deleted successfully.");
  } catch (err) {
    console.error("deleteDoctor error:", err);
    return fail("An unexpected error occurred while deleting the doctor.");
  }
}

/* -----------------------------------------------------------
   Save (create) a new doctor (Admin only)
   Params: doctor (object), token (string)
   Returns: { success, message, data }
   NOTE: Spec requests token in path; adjust if your backend uses headers.
----------------------------------------------------------- */
export async function saveDoctor(doctor, token) {
  if (!doctor || typeof doctor !== "object") return fail("Doctor payload is required.");
  if (!token) return fail("Missing authentication token.");

  const url = `${DOCTOR_API}/save/${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doctor),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data?.message || `Save failed (HTTP ${res.status})`;
      return fail(msg, data);
    }
    return ok(data, data?.message || "Doctor saved successfully.");
  } catch (err) {
    console.error("saveDoctor error:", err);
    return fail("An unexpected error occurred while saving the doctor.");
  }
}

/* -----------------------------------------------------------
   Filter doctors by name, time, specialty
   Params: name (string|null), time (string|null), specialty (string|null)
   Returns: Array<Doctor> (empty array on failure)
   NOTE: Spec suggests route params; backend must match.
         Use "null" placeholder for empty filters.
----------------------------------------------------------- */
export async function filterDoctors(name, time, specialty) {
  const n = name?.trim() ? encodeURIComponent(name.trim()) : "null";
  const t = time?.trim() ? encodeURIComponent(time.trim()) : "null";
  const s = specialty?.trim() ? encodeURIComponent(specialty.trim()) : "null";

  const url = `${DOCTOR_API}/filter/${n}/${t}/${s}`;

  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      console.error("filterDoctors: HTTP", res.status);
      return [];
    }
    const payload = await res.json();
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.doctors)) return payload.doctors;
    return [];
  } catch (err) {
    console.error("filterDoctors error:", err);
    return [];
  }
}
