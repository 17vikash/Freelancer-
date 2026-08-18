/**
 * Freelancer Marketplace — Email OTP Verification Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");
  const otpPreview = urlParams.get("otp");

  if (!email) {
    window.location.href = "signup.html";
    return;
  }

  const emailDisplay = document.getElementById("target-email-display");
  if (emailDisplay) emailDisplay.textContent = email;

  setupOTPInputAutoAdvance();

  const otpForm = document.getElementById("otp-form");
  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    let otpCode = "";
    for (let i = 1; i <= 6; i++) {
      const val = document.getElementById(`otp-${i}`).value;
      otpCode += val;
    }

    if (otpCode.length < 6) {
      showError("Please enter the complete 6-digit verification code.");
      return;
    }

    const verifyBtn = document.getElementById("verify-btn");
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> Verifying...`;

    try {
      const res = await apiRequest("/auth/verify-otp", "POST", { email, otp: otpCode });

      setAuth(res.token, res.user);
      showToast("Email verified successfully! Redirecting to workspace...", "success");

      setTimeout(() => {
        if (res.user.role === "client") {
          window.location.href = "client-dashboard.html";
        } else {
          window.location.href = "freelancer-dashboard.html";
        }
      }, 600);

    } catch (err) {
      showError(err.message || "Invalid or expired verification code.");
    } finally {
      verifyBtn.disabled = false;
      verifyBtn.innerHTML = `<span>Verify & Activate Account</span> <i class="fas fa-arrow-right ms-1"></i>`;
    }
  });
});

function setupOTPInputAutoAdvance() {
  for (let i = 1; i <= 6; i++) {
    const box = document.getElementById(`otp-${i}`);
    if (!box) continue;

    box.addEventListener("input", (e) => {
      const val = e.target.value;
      if (val.length === 1 && i < 6) {
        document.getElementById(`otp-${i + 1}`).focus();
      }
    });

    box.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && i > 1) {
        document.getElementById(`otp-${i - 1}`).focus();
      }
    });

    box.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData).getData("text").trim();
      if (/^\d{6}$/.test(pastedData)) {
        pastedData.split("").forEach((digit, idx) => {
          const b = document.getElementById(`otp-${idx + 1}`);
          if (b) b.value = digit;
        });
        document.getElementById("otp-6").focus();
      }
    });
  }
}

async function resendVerificationCode() {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");
  if (!email) return;

  const resendBtn = document.getElementById("resend-btn");
  const resendTimer = document.getElementById("resend-timer");

  resendBtn.disabled = true;

  try {
    const res = await apiRequest("/auth/resend-otp", "POST", { email });
    showToast(res.message || "Fresh verification code sent to your email.", "success");
    startResendCountdown();
  } catch (err) {
    showToast(err.message || "Failed to resend code.", "error");
    resendBtn.disabled = false;
  }
}

function startResendCountdown() {
  const resendBtn = document.getElementById("resend-btn");
  const resendTimer = document.getElementById("resend-timer");
  let timeLeft = 60;

  resendBtn.disabled = true;
  resendTimer.classList.remove("d-none");

  const interval = setInterval(() => {
    timeLeft--;
    resendTimer.textContent = `(${timeLeft}s)`;
    if (timeLeft <= 0) {
      clearInterval(interval);
      resendBtn.disabled = false;
      resendTimer.classList.add("d-none");
    }
  }, 1000);
}

function showError(msg) {
  const errorText = document.getElementById("otp-error-text");
  const errorBanner = document.getElementById("otp-error-banner");
  if (errorText && errorBanner) {
    errorText.textContent = msg;
    errorBanner.classList.remove("d-none");
  }
}

function hideError() {
  const errorBanner = document.getElementById("otp-error-banner");
  if (errorBanner) errorBanner.classList.add("d-none");
}
