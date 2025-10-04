/* app/src/main/resources/static/js/components/footer.js
   Static, reusable footer rendered on all pages that include <div id="footer"></div>.
   - No role-based logic; same footer everywhere
   - Safe to call multiple times
*/

(function () {
  function renderFooter() {
    const footer = document.getElementById("footer");
    if (!footer) return; // page doesn't have a footer container

    const year = new Date().getFullYear();

    footer.innerHTML = `
      <footer class="footer" role="contentinfo" aria-label="Site footer">
        <div class="footer-container">
          <div class="footer-top">
            <div class="footer-logo">
              <img src="/assets/images/logo/logo.png" alt="Hospital CMS Logo" class="footer-logo-img" />
              <p class="footer-copy">© ${year} Hospital CMS. All rights reserved.</p>
            </div>

            <div class="footer-links">
              <div class="footer-column">
                <h4>Company</h4>
                <a href="#" rel="nofollow">About</a>
                <a href="#" rel="nofollow">Careers</a>
                <a href="#" rel="nofollow">Press</a>
              </div>

              <div class="footer-column">
                <h4>Support</h4>
                <a href="#" rel="nofollow">Account</a>
                <a href="#" rel="nofollow">Help Center</a>
                <a href="#" rel="nofollow">Contact</a>
              </div>

              <div class="footer-column">
                <h4>Legals</h4>
                <a href="#" rel="nofollow">Terms &amp; Conditions</a>
                <a href="#" rel="nofollow">Privacy Policy</a>
                <a href="#" rel="nofollow">Licensing</a>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <nav class="footer-nav" aria-label="Footer navigation">
              <a href="/" class="footer-nav-link">Home</a>
              <a href="#" class="footer-nav-link">Doctors</a>
              <a href="#" class="footer-nav-link">Appointments</a>
            </nav>
          </div>
        </div>
      </footer>
    `;
  }

  // expose for manual use if needed
  window.renderFooter = renderFooter;

  // auto-render on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderFooter);
  } else {
    renderFooter();
  }
})();
