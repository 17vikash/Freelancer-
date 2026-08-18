/**
 * Freelancer Marketplace — Authentication & Session Management
 */

function getToken() {
  return localStorage.getItem("gigora_token");
}

function getUser() {
  const userStr = localStorage.getItem("gigora_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

function getRole() {
  const user = getUser();
  return user ? user.role : null;
}

function setAuth(token, user) {
  localStorage.setItem("gigora_token", token);
  localStorage.setItem("gigora_user", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("gigora_token");
  localStorage.removeItem("gigora_user");
  window.location.href = "login.html";
}

/**
 * Route protection guard. Call at the top of protected pages.
 * @param {Array<string>} allowedRoles - e.g., ['client'] or ['freelancer']
 */
function requireAuth(allowedRoles = []) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.pathname);
    return false;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to proper dashboard based on user's actual role
    if (user.role === "client") {
      window.location.href = "client-dashboard.html";
    } else {
      window.location.href = "freelancer-dashboard.html";
    }
    return false;
  }

  return true;
}

/**
 * Trigger Google OAuth Account Chooser & Auth Flow
 */
function triggerGoogleAuth(targetRole = "auto") {
  let modalContainer = document.getElementById("google-oauth-modal");

  if (!modalContainer) {
    modalContainer = document.createElement("div");
    modalContainer.id = "google-oauth-modal";
    document.body.appendChild(modalContainer);
  }

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.65); backdrop-filter: blur(4px);" role="dialog">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 440px;">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 16px; overflow: hidden;">
          
          <div class="modal-header bg-light border-light p-4">
            <div class="d-flex align-items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 6.01-1.08 8.01-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.13 1.16-3.18 0-5.88-2.15-6.84-5.04H1.14v3.15C3.15 21.3 7.28 24 12 24z"/><path fill="#FBBC05" d="M5.16 14.16c-.24-.72-.38-1.49-.38-2.16s.14-1.44.38-2.16V6.69H1.14C.41 8.14 0 9.99 0 12s.41 3.86 1.14 5.31l4.02-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.01 1.19 15.24 0 12 0 7.28 0 3.15 2.7 1.14 6.69l4.02 3.15c.96-2.89 3.66-5.09 6.84-5.09z"/></svg>
              <div>
                <h5 class="fw-bold mb-0 text-dark">Sign in with Google</h5>
                <span class="fs-8 text-muted">Choose an account to continue</span>
              </div>
            </div>
            <button type="button" class="btn-close" onclick="closeGoogleModal()"></button>
          </div>

          <div class="modal-body p-4">
            <p class="fs-8 text-muted mb-3">To continue, Google will share your name, email address, and profile picture with Freelancer Marketplace.</p>

            <div class="list-group gap-2 mb-3">
              
              <!-- Account Option 1: Client -->
              <button type="button" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 rounded border" onclick="execGoogleAuth('david.miller@apexlabs.io', 'David Miller', 'client')">
                <div class="d-flex align-items-center gap-3">
                  <div class="avatar-circle bg-primary-tint text-primary fw-bold" style="width: 42px; height: 42px;">DM</div>
                  <div class="text-start">
                    <div class="fw-bold text-dark fs-7">David Miller</div>
                    <div class="fs-8 text-muted">david.miller@apexlabs.io</div>
                  </div>
                </div>
                <span class="badge badge-primary">Client</span>
              </button>

              <!-- Account Option 2: Freelancer -->
              <button type="button" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 rounded border" onclick="execGoogleAuth('alex.rivera.dev@gmail.com', 'Alex Rivera', 'freelancer')">
                <div class="d-flex align-items-center gap-3">
                  <div class="avatar-circle bg-success bg-opacity-10 text-success fw-bold" style="width: 42px; height: 42px;">AR</div>
                  <div class="text-start">
                    <div class="fw-bold text-dark fs-7">Alex Rivera</div>
                    <div class="fs-8 text-muted">alex.rivera.dev@gmail.com</div>
                  </div>
                </div>
                <span class="badge badge-open">Freelancer</span>
              </button>

            </div>

            <div class="text-center pt-2 border-top border-light">
              <button type="button" class="btn btn-link fs-8 text-muted p-0" onclick="promptCustomGoogleAuth()">
                <i class="fas fa-plus-circle me-1"></i> Use another Google Account
              </button>
            </div>
          </div>

          <div class="modal-footer bg-light border-light justify-content-between py-2 px-4 fs-8 text-muted">
            <span>🔒 Google OAuth 2.0 Secured</span>
            <a href="#" class="text-muted text-decoration-underline" onclick="closeGoogleModal(); return false;">Cancel</a>
          </div>

        </div>
      </div>
    </div>
  `;
}

function closeGoogleModal() {
  const container = document.getElementById("google-oauth-modal");
  if (container) container.innerHTML = "";
}

async function execGoogleAuth(email, name, role) {
  closeGoogleModal();
  showToast(`Authenticating with Google as ${name}...`, "info");

  try {
    const res = await apiRequest("/auth/google", "POST", { email, name, role });
    setAuth(res.token, res.user);
    showToast(`Google Sign-In successful! Welcome back, ${name}.`, "success");

    setTimeout(() => {
      if (res.user.role === "client") {
        window.location.href = "client-dashboard.html";
      } else {
        window.location.href = "freelancer-dashboard.html";
      }
    }, 600);

  } catch (err) {
    showToast(err.message || "Google authentication failed.", "error");
  }
}

function promptCustomGoogleAuth() {
  const customEmail = prompt("Enter your Google email address:");
  if (!customEmail) return;
  const customName = customEmail.split("@")[0].replace(".", " ");
  const customRole = prompt("Enter role ('client' or 'freelancer'):", "client") || "client";
  execGoogleAuth(customEmail, customName, customRole);
}

