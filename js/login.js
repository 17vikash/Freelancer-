/**
 * Freelancer Marketplace — Login Page Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, redirect to dashboard
  const user = getUser();
  if (user) {
    window.location.href = user.role === "client" ? "client-dashboard.html" : "freelancer-dashboard.html";
    return;
  }

  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorBanner = document.getElementById("login-error-banner");
  const errorText = document.getElementById("login-error-text");
  const loginBtn = document.getElementById("login-btn");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Client-side validation
    let valid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      emailInput.classList.add("is-invalid");
      valid = false;
    } else {
      emailInput.classList.remove("is-invalid");
    }

    if (!password) {
      passwordInput.classList.add("is-invalid");
      valid = false;
    } else {
      passwordInput.classList.remove("is-invalid");
    }

    if (!valid) return;

    // Loading state on button
    loginBtn.disabled = true;
    loginBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Logging in...`;

    try {
      const response = await apiRequest("/auth/login", "POST", { email, password });

      // Save token and user details
      setAuth(response.token, response.user);
      showToast("Login successful! Redirecting...", "success");

      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get("redirect");

        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else if (response.user.role === "client") {
          window.location.href = "client-dashboard.html";
        } else {
          window.location.href = "freelancer-dashboard.html";
        }
      }, 500);

    } catch (err) {
      if (err.message && (err.message.includes("not verified") || err.message.includes("verification OTP"))) {
        showToast("Email address not verified. Redirecting to OTP verification...", "info");
        setTimeout(() => {
          window.location.href = `verify-email.html?email=${encodeURIComponent(email)}`;
        }, 1000);
      } else {
        showError(err.message || "Invalid email or password. Please check your credentials and try again.");
      }
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = `<span>Log in</span> <i class="fas fa-arrow-right ms-1"></i>`;
    }
  });

  function showError(msg) {
    errorText.textContent = msg;
    errorBanner.classList.remove("d-none");
  }

  function hideError() {
    errorBanner.classList.add("d-none");
  }
});



function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    btn.innerHTML = `<i class="far fa-eye-slash"></i>`;
  } else {
    input.type = "password";
    btn.innerHTML = `<i class="far fa-eye"></i>`;
  }
}
