/**
 * Freelancer Marketplace — Signup Page Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // Check if role is preselected via query string ?role=freelancer or ?role=client
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedRole = urlParams.get("role");
  if (preselectedRole === "freelancer") {
    selectRole("freelancer");
  } else {
    selectRole("client");
  }

  const signupForm = document.getElementById("signup-form");
  const errorBanner = document.getElementById("signup-error-banner");
  const errorText = document.getElementById("signup-error-text");
  const signupBtn = document.getElementById("signup-btn");

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const role = document.getElementById("selected-role").value;
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const primarySkill = document.getElementById("primarySkill").value;
    const hourlyRate = parseFloat(document.getElementById("hourlyRate").value) || 0;

    // Client-side validation
    let valid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName) {
      document.getElementById("fullName").classList.add("is-invalid");
      valid = false;
    } else {
      document.getElementById("fullName").classList.remove("is-invalid");
    }

    if (!email || !emailRegex.test(email)) {
      document.getElementById("email").classList.add("is-invalid");
      valid = false;
    } else {
      document.getElementById("email").classList.remove("is-invalid");
    }

    if (!password || password.length < 8) {
      document.getElementById("password").classList.add("is-invalid");
      valid = false;
    } else {
      document.getElementById("password").classList.remove("is-invalid");
    }

    if (password !== confirmPassword) {
      document.getElementById("confirmPassword").classList.add("is-invalid");
      document.getElementById("confirm-pwd-feedback").textContent = "Passwords do not match.";
      valid = false;
    } else {
      document.getElementById("confirmPassword").classList.remove("is-invalid");
    }

    if (!valid) return;

    // Build payload
    const body = {
      role,
      name: fullName,
      email,
      password,
      confirmPassword,
      ...(role === "freelancer" ? { primarySkill, hourlyRate } : {})
    };

    signupBtn.disabled = true;
    signupBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Creating Account...`;

    try {
      const response = await apiRequest("/auth/signup", "POST", body);
      showToast("Account created! Verification code sent to your email.", "success");

      setTimeout(() => {
        window.location.href = `verify-email.html?email=${encodeURIComponent(email)}`;
      }, 600);

    } catch (err) {
      showError(err.message || "Failed to create account. Please try again.");
    } finally {
      signupBtn.disabled = false;
      signupBtn.innerHTML = `<span>Create Account</span> <i class="fas fa-user-plus ms-1"></i>`;
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

function selectRole(role) {
  const clientBtn = document.getElementById("role-client-btn");
  const freelancerBtn = document.getElementById("role-freelancer-btn");
  const freelancerFields = document.getElementById("freelancer-fields");
  const roleInput = document.getElementById("selected-role");

  roleInput.value = role;

  if (role === "freelancer") {
    freelancerBtn.classList.add("active", "text-dark");
    freelancerBtn.classList.remove("text-muted");
    clientBtn.classList.remove("active", "text-dark");
    clientBtn.classList.add("text-muted");
    freelancerFields.classList.remove("d-none");
  } else {
    clientBtn.classList.add("active", "text-dark");
    clientBtn.classList.remove("text-muted");
    freelancerBtn.classList.remove("active", "text-dark");
    freelancerBtn.classList.add("text-muted");
    freelancerFields.classList.add("d-none");
  }
}
