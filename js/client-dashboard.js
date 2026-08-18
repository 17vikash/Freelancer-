/**
 * Freelancer Marketplace — Client Dashboard Controller
 */

document.addEventListener("DOMContentLoaded", async () => {
  // Enforce client role authentication
  if (!requireAuth(["client"])) return;

  const user = getUser();
  if (user && user.name) {
    const sidebarName = document.getElementById("sidebar-client-name");
    if (sidebarName) sidebarName.textContent = user.name;
  }

  await Promise.all([loadStats(), loadJobs()]);

  // Smooth scroll if landed via #my-jobs-section hash link
  if (window.location.hash === "#my-jobs-section") {
    setTimeout(() => {
      const section = document.getElementById("my-jobs-section");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }
});

async function loadStats() {
  try {
    const stats = await apiRequest("/clients/me/stats");
    document.getElementById("stat-active-jobs").textContent = stats.activeJobs || 0;
    document.getElementById("stat-total-spent").textContent = `₹${(stats.totalSpent || 0).toLocaleString()}`;
    document.getElementById("stat-avg-rating").textContent = `${stats.avgRatingGiven || 5.0}★`;
  } catch (err) {
    showToast("Failed to load client statistics.", "error");
  }
}

async function loadJobs() {
  const skeleton = document.getElementById("client-jobs-skeleton");
  const tableWrapper = document.getElementById("client-jobs-table-wrapper");
  const emptyState = document.getElementById("client-jobs-empty");
  const tbody = document.getElementById("client-jobs-tbody");
  const countText = document.getElementById("jobs-count-text");

  try {
    const jobs = await apiRequest("/clients/me/jobs");
    countText.textContent = `${jobs.length} Total Listing${jobs.length === 1 ? '' : 's'}`;

    if (jobs.length === 0) {
      emptyState.classList.remove("d-none");
      return;
    }

    tbody.innerHTML = jobs.map(job => {
      let statusBadge = `<span class="badge badge-open"><span class="pulse-dot me-1"></span> Open</span>`;
      if (job.status === "In Progress") statusBadge = `<span class="badge badge-progress"><i class="fas fa-spinner fa-spin me-1"></i> In Progress</span>`;
      if (job.status === "Completed") statusBadge = `<span class="badge badge-completed"><i class="fas fa-check-circle me-1"></i> Completed</span>`;

      const formattedBudget = job.budgetType === "hourly" ? `₹${job.budget.toLocaleString()}/hr` : `₹${job.budget.toLocaleString()}`;

      return `
        <tr>
          <td>
            <a href="job-detail.html?id=${job.id}" class="fw-bold text-dark text-decoration-none hover-primary">${job.title}</a>
            <div class="fs-8 text-muted">Posted ${job.postedDate}</div>
          </td>
          <td><span class="badge badge-primary">${job.category}</span></td>
          <td><span class="job-budget text-primary fw-bold">${formattedBudget}</span></td>
          <td>
            <span class="mono-font fw-bold"><i class="fas fa-paper-plane text-muted me-1"></i>${job.proposalCount || 0}</span>
          </td>
          <td>${statusBadge}</td>
          <td>
            <a href="job-detail.html?id=${job.id}" class="gg-btn-outline gg-btn-sm py-1 px-2">
              View Proposals <i class="fas fa-arrow-right ms-1"></i>
            </a>
          </td>
        </tr>
      `;
    }).join("");

    tableWrapper.classList.remove("d-none");
  } catch (err) {
    showToast("Failed to load posted jobs.", "error");
    emptyState.classList.remove("d-none");
  } finally {
    skeleton.classList.add("d-none");
  }
}
