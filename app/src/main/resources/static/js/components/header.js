/* app/src/main/resources/static/js/components/header.js
   Reusable role-aware header for all pages.
   - Hides role header on homepage (/)
   - Reads role/token from localStorage
   - Injects role-specific actions
   - Wires up listeners after injection
*/

(function () {
  // ---- small helpers ----
  const qs = (sel, root = document) => root.querySelector(sel);

  // Expose a minimal modal opener if the project provides one elsewhere.
  function safeOpenModal(kind) {
    if (typeof window.openModal === "function") {
      window.openModal(kind);
    } else {
      console.warn(`openModal("${kind}") is not defined yet.`);
    }
  }

  // ---- logout helpers ----
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    window.location.href = "/";
  }

  function logoutPatient() {
    localStorage.removeItem("token");
    localStorage.setItem("userRole", "patient"); // keep patient role to show login/signup again
    window.location.href = "/pages/patientDashboard.html";
  }

  // Optional role switch (doctor "Home" button or future use)
  function selectRole(nextRole) {
    if (!nextRole) return;
    localStorage.setItem("userRole", nextRole);
    // Simple route suggestion—adjust if your app uses different URLs
    if (nextRole === "doctor") {
      window.location.href = "/doctor/doctorDashboard";
    } else if (nextRole === "admin") {
      window.location.href = "/admin/adminDashboard";
    } else if (nextRole === "patient" || nextRole === "loggedPatient") {
      window.location.href = "/pages/patientDashboard.html";
    }
  }

  // ---- attach listeners to newly injected buttons ----
  function attachHeaderButtonListeners() {
    const addDocBtn = qs("#addDocBtn");
    if (addDocBtn) {
      addDocBtn.addEventListener("click", () => safeOpenModal("addDoctor"));
    }

    const patientLogin = qs("#patientLogin");
    if (patientLogin) {
      patientLogin.addEventListener("click", () => safeOpenModal("patientLogin"));
    }

    const patientSignup = qs("#patientSignup");
    if (patientSignup) {
      patientSignup.addEventListener("click", () => safeOpenModal("patientSignup"));
    }

    const homeBtn = qs("#homeBtn");
    if (homeBtn) {
      homeBtn.addEventListener("click", () => {
        // route based on current role
        const role = localStorage.getItem("userRole");
        if (role === "doctor") selectRole("doctor");
        else if (role === "admin") selectRole("admin");
        else window.location.href = "/"; // fallback
      });
    }

    const apptBtn = qs("#patientAppointments");
    if (apptBtn) {
      apptBtn.addEventListener("click", () => {
        window.location.href = "/pages/patientAppointments.html";
      });
    }

    const logoutLinks = document.querySelectorAll("[data-logout='any']");
    logoutLinks.forEach((el) =>
      el.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
      })
    );

    const logoutPatientLinks = document.querySelectorAll("[data-logout='patient']");
    logoutPatientLinks.forEach((el) =>
      el.addEventListener("click", (e) => {
        e.preventDefault();
        logoutPatient();
      })
    );
  }

  // ---- main render ----
  function renderHeader() {
    const headerDiv = document.getElementById("header");
    if (!headerDiv) return;

    // If homepage (root), clear auth + render a minimal header (no role UI)
    if (window.location.pathname.endsWith("/")) {
      localStorage.removeItem("userRole");
      localStorage.removeItem("token");
      headerDiv.innerHTML = `
        <header class="header">
          <div class="logo-section">
            <img src="../assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
            <span class="logo-title">Hospital CMS</span>
          </div>
        </header>`;
      return;
    }

    // Read role/token from storage
    const role = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");

    // Guard: role that requires token but none present -> reset & bounce home
    if ((role === "loggedPatient" || role === "admin" || role === "doctor") && !token) {
      localStorage.removeItem("userRole");
      alert("Session expired or invalid login. Please log in again.");
      window.location.href = "/";
      return;
    }

    // Base header shell
    let headerContent = `
      <header class="header">
        <div class="logo-section">
          <img src="../assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
          <span class="logo-title">Hospital CMS</span>
        </div>
        <nav class="header-nav">`;

    // Role-specific actions
    if (role === "admin") {
      headerContent += `
          <button id="addDocBtn" class="adminBtn" type="button">Add Doctor</button>
          <a href="#" data-logout="any">Logout</a>`;
    } else if (role === "doctor") {
      headerContent += `
          <button id="homeBtn" class="adminBtn" type="button">Home</button>
          <a href="#" data-logout="any">Logout</a>`;
    } else if (role === "loggedPatient") {
      headerContent += `
          <button id="home" class="adminBtn" type="button" onclick="window.location.href='/pages/loggedPatientDashboard.html'">Home</button>
          <button id="patientAppointments" class="adminBtn" type="button">Appointments</button>
          <a href="#" data-logout="patient">Logout</a>`;
    } else {
      // default / anonymous patient header
      headerContent += `
          <button id="patientLogin" class="adminBtn" type="button">Login</button>
          <button id="patientSignup" class="adminBtn" type="button">Sign Up</button>`;
    }

    // Close shell
    headerContent += `
        </nav>
      </header>`;

    // Inject + wire up events
    headerDiv.innerHTML = headerContent;
    attachHeaderButtonListeners();
  }

  // Expose functions globally for other scripts if needed
  window.renderHeader = renderHeader;
  window.logout = logout;
  window.logoutPatient = logoutPatient;
  window.selectRole = selectRole;

  // Auto-render on DOM ready in case header.js is loaded before body end
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderHeader);
  } else {
    renderHeader();
  }
})();
