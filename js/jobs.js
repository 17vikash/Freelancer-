/**
 * Freelancer Marketplace — Job Listings Controller
 */

let debounceTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  // Pre-fill query parameters if present (e.g., jobs.html?category=Web+Development)
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get("category");
  if (categoryParam) {
    const targetRadio = document.querySelector(`.filter-category[value="${CSS.escape(categoryParam)}"]`);
    if (targetRadio) targetRadio.checked = true;
  }

  // Check if logged in as Client to display client banner
  const user = getUser();
  const banner = document.getElementById("client-notice-banner");
  if (user && user.role === "client" && banner) {
    banner.className = "alert alert-primary d-flex align-items-center justify-content-between p-3 mb-4 border-0 shadow-sm";
    banner.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <i class="fas fa-building text-primary fs-5"></i>
        <span>You are viewing marketplace listings as a <strong>Client (${user.name})</strong>. Ready to hire talent for your project?</span>
      </div>
      <a href="post-job.html" class="gg-btn-primary gg-btn-sm text-nowrap"><i class="fas fa-plus me-1"></i>Post a Job</a>
    `;
  }

  // Initial Fetch
  fetchJobs();

  // Attach Input & Change Event Listeners (300ms Debounce)
  document.getElementById("search-input").addEventListener("input", debouncedFetch);
  document.getElementById("budget-slider").addEventListener("input", (e) => {
    document.getElementById("budget-value").textContent = `₹${parseInt(e.target.value).toLocaleString()}`;
    debouncedFetch();
  });

  document.querySelectorAll(".filter-category").forEach(radio => {
    radio.addEventListener("change", fetchJobs);
  });

  document.querySelectorAll(".filter-type").forEach(radio => {
    radio.addEventListener("change", fetchJobs);
  });

  document.getElementById("reset-filters-btn").addEventListener("click", resetAllFilters);
});

function debouncedFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchJobs();
  }, 300);
}

async function fetchJobs() {
  const container = document.getElementById("jobs-container");
  const skeleton = document.getElementById("jobs-skeleton");
  const emptyState = document.getElementById("jobs-empty-state");
  const countBadge = document.getElementById("job-count-badge");

  // Show Skeleton Shimmer Loading State
  container.innerHTML = "";
  emptyState.classList.add("d-none");
  skeleton.classList.remove("d-none");

  const search = document.getElementById("search-input").value.trim();
  const categoryRadio = document.querySelector(".filter-category:checked");
  const category = categoryRadio ? categoryRadio.value : "";
  const budget = document.getElementById("budget-slider").value;
  const typeRadio = document.querySelector(".filter-type:checked");
  const budgetType = typeRadio ? typeRadio.value : "";

  // Construct Query String
  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (category) queryParams.set("category", category);
  if (budget) queryParams.set("budget", budget);
  if (budgetType) queryParams.set("budgetType", budgetType);

  try {
    const data = await apiRequest(`/jobs?${queryParams.toString()}`);
    const jobs = data.jobs || [];

    countBadge.textContent = `${jobs.length} Gig${jobs.length === 1 ? '' : 's'} Available`;

    if (jobs.length === 0) {
      emptyState.classList.remove("d-none");
    } else {
      renderJobCards(jobs);
    }
  } catch (err) {
    showToast("Failed to load job listings. Please check connection.", "error");
    emptyState.classList.remove("d-none");
  } finally {
    skeleton.classList.add("d-none");
  }
}

function renderJobCards(jobs) {
  const container = document.getElementById("jobs-container");
  
  container.innerHTML = jobs.map(job => {
    const budgetFormatted = job.budgetType === "hourly" 
      ? `₹${job.budget.toLocaleString()}/hr`
      : `₹${job.budget.toLocaleString()}`;

    const skillTags = (job.skills || []).map(skill => `<span class="skill-tag">${skill}</span>`).join(" ");

    return `
      <div class="col-12">
        <div class="gg-card gg-card-interactive p-4 h-100 position-relative">
          <div class="row align-items-center g-3">
            <div class="col-lg-8">
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge badge-primary">${job.category}</span>
                <span class="text-muted fs-8">•</span>
                <span class="text-muted fs-8">Posted ${job.postedDate}</span>
                <span class="text-muted fs-8">•</span>
                <span class="text-muted fs-8"><i class="fas fa-user-check text-success me-1"></i>${job.clientName} (${job.clientRating}★)</span>
              </div>
              <h4 class="fw-bold h5 mb-2">
                <a href="job-detail.html?id=${job.id}" class="text-dark text-decoration-none hover-primary">${job.title}</a>
              </h4>
              <p class="text-muted fs-7 mb-3 text-truncate" style="max-width: 650px;">
                ${job.description}
              </p>
              <div class="d-flex flex-wrap gap-1">
                ${skillTags}
              </div>
            </div>

            <div class="col-lg-4 text-lg-end border-start-lg ps-lg-4 border-light pt-3 pt-lg-0 border-top border-top-lg-0">
              <div class="mb-2">
                <span class="text-muted fs-8 d-block text-uppercase fw-semibold">Est. ${job.budgetType === 'hourly' ? 'Rate' : 'Budget'}</span>
                <span class="job-budget fs-3 fw-bold text-primary">${budgetFormatted}</span>
              </div>
              <div class="mono-font fs-8 text-muted mb-3">
                <i class="fas fa-paper-plane me-1 text-primary"></i> ${job.proposalCount || 0} Proposals
              </div>
              <a href="job-detail.html?id=${job.id}" class="gg-btn-primary gg-btn-sm w-100 w-lg-auto">
                View Details <i class="fas fa-arrow-right ms-1"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function resetAllFilters() {
  document.getElementById("search-input").value = "";
  document.getElementById("cat-all").checked = true;
  document.getElementById("type-all").checked = true;
  document.getElementById("budget-slider").value = 100000;
  document.getElementById("budget-value").textContent = "₹100,000";
  fetchJobs();
}
