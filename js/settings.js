/**
 * Freelancer Marketplace — Settings Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // Enforce authentication for settings page
  if (!requireAuth()) return;

  const user = getUser();
  if (!user) return;

  // Pre-fill user data
  document.getElementById("settingsName").value = user.name || "";
  document.getElementById("settingsEmail").value = user.email || "";

  // Render role-specific fields
  const freelancerFields = document.getElementById("settings-freelancer-fields");
  if (user.role === "freelancer") {
    freelancerFields.classList.remove("d-none");
    document.getElementById("settingsTitle").value = user.title || "Senior Full-Stack Developer";
    document.getElementById("settingsRate").value = user.hourlyRate || 1500;
    document.getElementById("settingsSkills").value = (user.skills || ["React", "Node.js"]).join(", ");
    document.getElementById("settingsBio").value = user.bio || "";
  }

  // Profile Info Form Submit
  const profileForm = document.getElementById("profile-info-form");
  const saveBtn = document.getElementById("save-profile-btn");

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("settingsName").value.trim();
    if (!name) {
      showToast("Full name cannot be empty.", "warning");
      return;
    }

    const payload = {
      name,
      ...(user.role === "freelancer" ? {
        title: document.getElementById("settingsTitle").value.trim(),
        hourlyRate: parseFloat(document.getElementById("settingsRate").value) || 0,
        skills: document.getElementById("settingsSkills").value.split(",").map(s => s.trim()).filter(Boolean),
        bio: document.getElementById("settingsBio").value.trim()
      } : {})
    };

    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> Saving...`;

    try {
      await apiRequest("/users/me", "PUT", payload);

      // Update local storage user object
      const updatedUser = { ...user, ...payload };
      localStorage.setItem("gigora_user", JSON.stringify(updatedUser));

      showToast("Profile settings saved successfully!", "success");
      renderNavbar();

    } catch (err) {
      showToast(err.message || "Failed to save profile settings.", "error");
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `Save Profile Info`;
    }
  });

  // Password Change Form Submit
  const passwordForm = document.getElementById("password-change-form");
  const changePwdBtn = document.getElementById("change-pwd-btn");

  passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;

    if (!currentPassword) {
      showToast("Please enter your current password.", "warning");
      return;
    }

    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters long.", "warning");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast("New passwords do not match.", "warning");
      return;
    }

    changePwdBtn.disabled = true;
    changePwdBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> Updating...`;

    try {
      await apiRequest("/users/me", "PUT", { currentPassword, newPassword });
      showToast("Password updated successfully!", "success");
      passwordForm.reset();
    } catch (err) {
      showToast(err.message || "Failed to update password.", "error");
    } finally {
      changePwdBtn.disabled = false;
      changePwdBtn.innerHTML = `Update Password`;
    }
  });
});
