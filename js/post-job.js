/**
 * Freelancer Marketplace — Post Job Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // Enforce client authentication
  requireAuth(["client"]);

  // Set default deadline date (14 days from today)
  const defaultDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  document.getElementById("jobDeadline").value = defaultDeadline;

  // Real-time Preview Listeners
  const titleInput = document.getElementById("jobTitle");
  const categorySelect = document.getElementById("jobCategory");
  const descriptionInput = document.getElementById("jobDescription");
  const budgetInput = document.getElementById("budgetAmount");
  const skillsInput = document.getElementById("skillsInput");
  const deadlineInput = document.getElementById("jobDeadline");

  titleInput.addEventListener("input", updatePreview);
  categorySelect.addEventListener("change", updatePreview);
  descriptionInput.addEventListener("input", updatePreview);
  budgetInput.addEventListener("input", updatePreview);
  skillsInput.addEventListener("input", updatePreview);
  deadlineInput.addEventListener("change", updatePreview);

  // Initial preview sync
  updatePreview();

  // Form Submit Handler
  const form = document.getElementById("post-job-form");
  const postBtn = document.getElementById("post-job-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const description = descriptionInput.value.trim();
    const budgetType = document.getElementById("budgetType").value;
    const budget = parseFloat(budgetInput.value);
    const rawSkills = skillsInput.value;
    const deadline = deadlineInput.value;

    const skills = rawSkills.split(",").map(s => s.trim()).filter(Boolean);

    // Validation
    let valid = true;
    if (!title || title.length < 10) {
      titleInput.classList.add("is-invalid");
      valid = false;
    } else {
      titleInput.classList.remove("is-invalid");
    }

    if (!description || description.length < 30) {
      descriptionInput.classList.add("is-invalid");
      valid = false;
    } else {
      descriptionInput.classList.remove("is-invalid");
    }

    if (!budget || budget <= 0) {
      budgetInput.classList.add("is-invalid");
      valid = false;
    } else {
      budgetInput.classList.remove("is-invalid");
    }

    if (skills.length === 0) {
      skillsInput.classList.add("is-invalid");
      valid = false;
    } else {
      skillsInput.classList.remove("is-invalid");
    }

    if (!deadline) {
      deadlineInput.classList.add("is-invalid");
      valid = false;
    } else {
      deadlineInput.classList.remove("is-invalid");
    }

    if (!valid) return;

    postBtn.disabled = true;
    postBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> Publishing Job...`;

    try {
      await apiRequest("/jobs", "POST", {
        title,
        category,
        description,
        budgetType,
        budget,
        skills,
        deadline
      });

      showToast("Job published successfully!", "success");

      setTimeout(() => {
        window.location.href = "client-dashboard.html";
      }, 1000);

    } catch (err) {
      showToast(err.message || "Failed to publish job listing.", "error");
    } finally {
      postBtn.disabled = false;
      postBtn.innerHTML = `<span>Post Job</span> <i class="fas fa-paper-plane ms-1"></i>`;
    }
  });
});

function setBudgetType(type) {
  document.getElementById("budgetType").value = type;

  const fixedBtn = document.getElementById("type-fixed-btn");
  const hourlyBtn = document.getElementById("type-hourly-btn");

  if (type === "hourly") {
    hourlyBtn.classList.add("active", "bg-white", "shadow-sm", "text-dark");
    hourlyBtn.classList.remove("text-muted");
    fixedBtn.classList.remove("active", "bg-white", "shadow-sm", "text-dark");
    fixedBtn.classList.add("text-muted");
  } else {
    fixedBtn.classList.add("active", "bg-white", "shadow-sm", "text-dark");
    fixedBtn.classList.remove("text-muted");
    hourlyBtn.classList.remove("active", "bg-white", "shadow-sm", "text-dark");
    hourlyBtn.classList.add("text-muted");
  }

  updatePreview();
}

function updatePreview() {
  const title = document.getElementById("jobTitle").value.trim() || "Your Job Title Will Appear Here";
  const category = document.getElementById("jobCategory").value;
  const description = document.getElementById("jobDescription").value.trim() || "Your detailed job description will render in real-time as you type...";
  const budgetType = document.getElementById("budgetType").value;
  const budget = parseFloat(document.getElementById("budgetAmount").value) || 0;
  const rawSkills = document.getElementById("skillsInput").value;
  const deadline = document.getElementById("jobDeadline").value || "2026-08-30";

  document.getElementById("preview-title").textContent = title;
  document.getElementById("preview-category").textContent = category;
  document.getElementById("preview-description").textContent = description;
  document.getElementById("preview-type-label").textContent = budgetType === "hourly" ? "Est. Hourly Rate" : "Est. Fixed Budget";
  document.getElementById("preview-budget").textContent = budgetType === "hourly" ? `₹${budget.toLocaleString()}/hr` : `₹${budget.toLocaleString()}`;
  document.getElementById("preview-deadline").textContent = deadline;

  const skills = rawSkills.split(",").map(s => s.trim()).filter(Boolean);
  const skillsContainer = document.getElementById("preview-skills");
  if (skills.length > 0) {
    skillsContainer.innerHTML = skills.map(skill => `<span class="skill-tag">${skill}</span>`).join(" ");
  } else {
    skillsContainer.innerHTML = `<span class="skill-tag">React</span> <span class="skill-tag">Node.js</span>`;
  }
}
