/**
 * Freelancer Marketplace — Freelancer Dashboard Controller
 */

document.addEventListener("DOMContentLoaded", async () => {
  // Enforce freelancer role authentication
  if (!requireAuth(["freelancer"])) return;

  const user = getUser();
  if (user) {
    if (user.name) {
      const nameEl = document.getElementById("sidebar-freelancer-name");
      if (nameEl) nameEl.textContent = user.name;
    }
    const profileLink = document.getElementById("sidebar-profile-link");
    if (profileLink) profileLink.href = `profile.html?id=${user.id || 'free-301'}`;
  }

  await Promise.all([loadStats(), loadProposals()]);
});

async function loadStats() {
  try {
    const stats = await apiRequest("/freelancers/me/stats");
    document.getElementById("stat-applied-count").textContent = stats.appliedCount || 0;
    document.getElementById("stat-ongoing-projects").textContent = stats.ongoingProjects || 0;
    document.getElementById("stat-total-earned").textContent = `₹${(stats.totalEarned || 0).toLocaleString()}`;
    document.getElementById("stat-rating").textContent = `${stats.rating || 5.0}★`;
  } catch (err) {
    showToast("Failed to load freelancer stats.", "error");
  }
}

async function loadProposals() {
  const skeleton = document.getElementById("freelancer-proposals-skeleton");
  const container = document.getElementById("freelancer-proposals-container");
  const emptyState = document.getElementById("freelancer-proposals-empty");
  const countText = document.getElementById("proposals-count-text");

  try {
    const proposals = await apiRequest("/freelancers/me/proposals");
    countText.textContent = `${proposals.length} Submitted Proposal${proposals.length === 1 ? '' : 's'}`;

    if (proposals.length === 0) {
      emptyState.classList.remove("d-none");
      return;
    }

    container.innerHTML = proposals.map(prop => {
      let statusBadge = `<span class="badge badge-pending"><i class="fas fa-clock me-1"></i> Pending Review</span>`;
      if (prop.status === "Accepted") statusBadge = `<span class="badge badge-open"><i class="fas fa-check-circle me-1"></i> Accepted / Hired</span>`;
      if (prop.status === "Rejected") statusBadge = `<span class="badge badge-rejected"><i class="fas fa-times-circle me-1"></i> Declined</span>`;

      return `
        <div class="col-12">
          <div class="gg-card p-4">
            <div class="d-flex flex-wrap align-items-center justify-content-between g-3 mb-2">
              <div>
                <a href="job-detail.html?id=${prop.jobId}" class="fw-bold text-dark h6 text-decoration-none hover-primary">${prop.jobTitle}</a>
                <div class="fs-8 text-muted">Applied on ${prop.submittedDate}</div>
              </div>
              <div class="text-end">
                ${statusBadge}
              </div>
            </div>

            <p class="fs-7 text-muted mb-3 bg-light p-3 rounded">
              <strong>Your Pitch:</strong> "${prop.coverLetter}"
            </p>

            <div class="d-flex align-items-center justify-content-between pt-2 border-top border-light">
              <div class="d-flex align-items-center gap-3">
                <span class="mono-font fw-bold text-primary fs-6">Bid: ₹${prop.bidAmount.toLocaleString()}</span>
                <span class="text-muted fs-8">•</span>
                <span class="fs-8 text-muted"><i class="fas fa-calendar-alt me-1"></i>${prop.duration}</span>
              </div>
              <a href="job-detail.html?id=${prop.jobId}" class="gg-btn-outline gg-btn-sm">
                View Job <i class="fas fa-external-link-alt ms-1"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join("");

    container.classList.remove("d-none");
  } catch (err) {
    showToast("Failed to load proposals list.", "error");
    emptyState.classList.remove("d-none");
  } finally {
    skeleton.classList.add("d-none");
  }
}
