/**
 * Freelancer Marketplace — Job Detail & Proposal Controller
 */

let currentJobId = null;

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  currentJobId = urlParams.get("id") || "job-101";

  await loadJobDetail(currentJobId);
  setupProposalForm();
});

async function loadJobDetail(jobId) {
  const skeleton = document.getElementById("job-detail-skeleton");
  const content = document.getElementById("job-detail-content");

  try {
    const job = await apiRequest(`/jobs/${jobId}`);
    
    // Populate Job Metadata
    document.getElementById("job-title").textContent = job.title;
    document.getElementById("job-category").textContent = job.category;
    document.getElementById("job-posted-date").textContent = `Posted ${job.postedDate}`;
    document.getElementById("job-budget").textContent = job.budgetType === "hourly" 
      ? `₹${job.budget.toLocaleString()}/hr`
      : `₹${job.budget.toLocaleString()}`;
    document.getElementById("job-budget-type").textContent = job.budgetType === "hourly" ? "Hourly Rate" : "Fixed Price";
    document.getElementById("job-deadline").textContent = job.deadline || "Flexible";
    document.getElementById("job-description").textContent = job.description;

    document.getElementById("client-name").textContent = job.clientName || "Apex Client";
    document.getElementById("client-rating").textContent = job.clientRating || "5.0";

    // Skills
    const skillsContainer = document.getElementById("job-skills");
    skillsContainer.innerHTML = (job.skills || []).map(skill => `<span class="skill-tag">${skill}</span>`).join(" ");

    // Pre-fill bid amount with job budget
    document.getElementById("bidAmount").value = job.budget;

    // Control UI Visibility based on Auth Role
    const user = getUser();
    const submitProposalCard = document.getElementById("submit-proposal-card");
    const proposalGuestNotice = document.getElementById("proposal-guest-notice");
    const clientProposalsSection = document.getElementById("client-proposals-section");

    if (user && user.role === "freelancer") {
      submitProposalCard.classList.remove("d-none");
      proposalGuestNotice.classList.add("d-none");
    } else if (user && user.role === "client") {
      submitProposalCard.classList.add("d-none");
      proposalGuestNotice.classList.add("d-none");
      clientProposalsSection.classList.remove("d-none");
      loadClientProposals(jobId);
    } else {
      submitProposalCard.classList.add("d-none");
      proposalGuestNotice.classList.remove("d-none");
    }

  } catch (err) {
    showToast("Failed to load job details.", "error");
  } finally {
    skeleton.classList.add("d-none");
    content.classList.remove("d-none");
  }
}

function setupProposalForm() {
  const form = document.getElementById("proposal-form");
  const submitBtn = document.getElementById("submit-proposal-btn");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const bidAmount = parseFloat(document.getElementById("bidAmount").value);
    const duration = document.getElementById("estimatedDuration").value;
    const coverLetter = document.getElementById("coverLetter").value.trim();

    let valid = true;
    if (!bidAmount || bidAmount <= 0) {
      document.getElementById("bidAmount").classList.add("is-invalid");
      valid = false;
    } else {
      document.getElementById("bidAmount").classList.remove("is-invalid");
    }

    if (!coverLetter || coverLetter.length < 20) {
      document.getElementById("coverLetter").classList.add("is-invalid");
      valid = false;
    } else {
      document.getElementById("coverLetter").classList.remove("is-invalid");
    }

    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> Submitting...`;

    try {
      await apiRequest(`/jobs/${currentJobId}/proposals`, "POST", {
        jobId: currentJobId,
        bidAmount,
        duration,
        coverLetter
      });

      showToast("Proposal submitted successfully!", "success");
      form.reset();

      setTimeout(() => {
        window.location.href = "freelancer-dashboard.html";
      }, 1000);

    } catch (err) {
      showToast(err.message || "Failed to submit proposal.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Submit Proposal</span> <i class="fas fa-arrow-right ms-1"></i>`;
    }
  });
}

async function loadClientProposals(jobId) {
  const container = document.getElementById("proposals-list-container");
  const badge = document.getElementById("proposals-count-badge");

  try {
    const res = await apiRequest(`/jobs/${jobId}/proposals`);
    const proposals = Array.isArray(res) ? res : (res.proposals || []);
    badge.textContent = `${proposals.length} Bids`;

    if (proposals.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-muted">
          <i class="fas fa-inbox fs-2 mb-2 d-block"></i>
          No proposals submitted for this gig yet.
        </div>
      `;
      return;
    }

    container.innerHTML = proposals.map(prop => `
      <div class="p-3 border border-light rounded mb-3 bg-white">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-circle bg-primary-tint text-primary fw-bold">${prop.freelancerName.slice(0, 2).toUpperCase()}</div>
            <div>
              <div class="fw-bold">${prop.freelancerName}</div>
              <div class="fs-8 text-muted">Submitted ${prop.submittedDate}</div>
            </div>
          </div>
          <div class="text-end">
            <span class="mono-font fw-bold fs-5 text-primary">₹${prop.bidAmount.toLocaleString()}</span>
            <div class="fs-8 text-muted">${prop.duration}</div>
          </div>
        </div>

        <p class="fs-7 text-muted mb-3 bg-light p-2 rounded">
          "${prop.coverLetter}"
        </p>

        <div class="d-flex align-items-center justify-content-between pt-2 border-top border-light">
          <span class="badge ${prop.status === 'Accepted' ? 'badge-open' : prop.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}">
            ${prop.status}
          </span>
          <div class="d-flex gap-2">
            <button class="gg-btn-outline gg-btn-sm text-danger border-danger" onclick="updateProposalStatus('${prop.id}', 'Rejected')">Reject</button>
            <button class="gg-btn-primary gg-btn-sm" onclick="updateProposalStatus('${prop.id}', 'Accepted')">Accept Bid</button>
          </div>
        </div>
      </div>
    `).join("");

  } catch (err) {
    container.innerHTML = `<div class="text-danger fs-7">Failed to load proposals.</div>`;
  }
}

async function updateProposalStatus(proposalId, newStatus) {
  try {
    await apiRequest(`/proposals/${proposalId}`, "PUT", { status: newStatus });
    showToast(`Proposal marked as ${newStatus}!`, newStatus === "Accepted" ? "success" : "info");
    loadClientProposals(currentJobId);
  } catch (err) {
    showToast("Failed to update status.", "error");
  }
}
