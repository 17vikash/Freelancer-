/**
 * Freelancer Marketplace — Dedicated Client Jobs Page Controller
 */

let allClientJobs = [];
let currentFilterStatus = "all";

document.addEventListener("DOMContentLoaded", async () => {
  // Enforce client auth
  if (!requireAuth(["client"])) return;

  const user = getUser();
  if (user && user.name) {
    const sidebarName = document.getElementById("sidebar-client-name");
    if (sidebarName) sidebarName.textContent = user.name;
  }

  await loadClientJobs();

  // Search input listener
  document.getElementById("my-jobs-search").addEventListener("input", filterAndRenderJobs);
});

async function loadClientJobs() {
  const skeleton = document.getElementById("my-jobs-skeleton");
  const wrapper = document.getElementById("my-jobs-table-wrapper");
  const empty = document.getElementById("my-jobs-empty");

  try {
    allClientJobs = await apiRequest("/clients/me/jobs");
    filterAndRenderJobs();
  } catch (err) {
    showToast("Failed to load your posted jobs.", "error");
    empty.classList.remove("d-none");
  } finally {
    skeleton.classList.add("d-none");
  }
}

function filterMyJobs(status) {
  currentFilterStatus = status;

  // Update active state on status buttons
  document.querySelectorAll(".status-filter-btn").forEach(btn => {
    btn.classList.remove("active", "btn-primary");
    btn.classList.add("btn-outline-secondary");
  });

  const activeBtn = event.target;
  if (activeBtn) {
    activeBtn.classList.add("active");
  }

  filterAndRenderJobs();
}

function filterAndRenderJobs() {
  const wrapper = document.getElementById("my-jobs-table-wrapper");
  const empty = document.getElementById("my-jobs-empty");
  const tbody = document.getElementById("my-jobs-tbody");
  const searchText = document.getElementById("my-jobs-search").value.trim().toLowerCase();

  let filtered = allClientJobs.filter(job => {
    const matchSearch = !searchText || job.title.toLowerCase().includes(searchText) || job.category.toLowerCase().includes(searchText);
    
    let matchStatus = true;
    if (currentFilterStatus === "open") matchStatus = job.status === "Open" || job.status === "open";
    if (currentFilterStatus === "in_progress") matchStatus = job.status === "In Progress" || job.status === "in_progress";
    if (currentFilterStatus === "completed") matchStatus = job.status === "Completed" || job.status === "completed";

    return matchSearch && matchStatus;
  });

  if (filtered.length === 0) {
    wrapper.classList.add("d-none");
    empty.classList.remove("d-none");
    return;
  }

  empty.classList.add("d-none");
  wrapper.classList.remove("d-none");

  tbody.innerHTML = filtered.map(job => {
    let statusBadge = `<span class="badge badge-open"><span class="pulse-dot me-1"></span> Open</span>`;
    if (job.status === "In Progress" || job.status === "in_progress") {
      statusBadge = `<span class="badge badge-progress"><i class="fas fa-spinner fa-spin me-1"></i> In Progress</span>`;
    }
    if (job.status === "Completed" || job.status === "completed") {
      statusBadge = `<span class="badge badge-completed"><i class="fas fa-check-circle me-1"></i> Completed</span>`;
    }

    const formattedBudget = job.budgetType === "hourly" ? `₹${job.budget.toLocaleString()}/hr` : `₹${job.budget.toLocaleString()}`;

    return `
      <tr>
        <td>
          <a href="job-detail.html?id=${job.id}" class="fw-bold text-dark text-decoration-none hover-primary">${job.title}</a>
          <div class="fs-8 text-muted">Posted ${job.postedDate}</div>
        </td>
        <td><span class="badge badge-primary">${job.category}</span></td>
        <td><span class="job-budget text-primary fw-bold">${formattedBudget}</span></td>
        <td class="mono-font fs-7">${job.deadline || 'Flexible'}</td>
        <td>
          <span class="mono-font fw-bold text-dark"><i class="fas fa-paper-plane text-primary me-1"></i>${job.proposalCount || 0} Bids</span>
        </td>
        <td>${statusBadge}</td>
        <td class="text-end">
          <div class="d-flex justify-content-end gap-2">
            <a href="job-detail.html?id=${job.id}" class="gg-btn-primary gg-btn-sm py-1 px-2">
              View Bids <i class="fas fa-arrow-right ms-1"></i>
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}
