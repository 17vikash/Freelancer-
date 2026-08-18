/**
 * Freelancer Marketplace — Index / Landing Page Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // Dismiss preloader overlay smoothly
  const preloader = document.getElementById("preloader");
  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = "0";
      setTimeout(() => {
        preloader.style.display = "none";
      }, 400);
    }, 500);
  }

  loadLiveLandingData();
});

async function loadLiveLandingData() {
  try {
    const res = await apiRequest("/jobs");
    const jobs = res.jobs || [];

    const talentBadge = document.getElementById("hero-talent-badge");
    const previewContainer = document.getElementById("hero-preview-card");
    const tickerContainer = document.getElementById("live-ticker-container");

    if (talentBadge) {
      talentBadge.textContent = `${jobs.length > 0 ? jobs.length * 5 : 0} Verified Talent Available Now`;
    }

    if (jobs.length > 0) {
      const topJob = jobs[0];
      const skillsHtml = (topJob.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join(" ");

      if (previewContainer) {
        previewContainer.innerHTML = `
          <div class="d-flex align-items-center justify-content-between mb-3">
            <span class="badge badge-open"><span class="pulse-dot me-1"></span> LIVE GIG</span>
            <span class="mono-font text-muted fs-7">${topJob.postedDate || "Just now"}</span>
          </div>

          <h4 class="mb-3">${topJob.title}</h4>
          <p class="text-muted fs-7 mb-3">${topJob.description ? topJob.description.substring(0, 100) + "..." : ""}</p>

          <div class="d-flex flex-wrap gap-1 mb-4">
            ${skillsHtml}
          </div>

          <div class="d-flex align-items-center justify-content-between pt-3 border-top border-light">
            <div>
              <span class="text-muted fs-8 d-block">Est. Budget</span>
              <span class="job-budget fs-4 fw-bold text-primary">₹${(topJob.budget || 0).toLocaleString()}${topJob.budgetType === "hourly" ? "/hr" : ""}</span>
            </div>
            <a href="job-detail.html?id=${topJob.id || topJob._id}" class="gg-btn-primary">View & Bid</a>
          </div>
        `;
      }

      if (tickerContainer) {
        const tickerHtml = jobs.map(j => `
          <div class="ticker-item"><span class="pulse-dot"></span> <span class="mono-font fw-bold text-primary">JUST POSTED:</span> ${j.title} <span class="badge badge-primary">₹${(j.budget||0).toLocaleString()}</span></div>
        `).join("");
        tickerContainer.innerHTML = tickerHtml + tickerHtml;
      }
    }
  } catch (e) {
    console.log("No live jobs fetched yet.");
  }
}

/**
 * Toggle between Client and Freelancer dual paths in How It Works section
 */
function switchPath(path) {
  const clientPath = document.getElementById("path-client");
  const freelancerPath = document.getElementById("path-freelancer");
  const clientBtn = document.getElementById("tab-client-btn");
  const freelancerBtn = document.getElementById("tab-freelancer-btn");

  if (path === "client") {
    clientPath.classList.remove("d-none");
    freelancerPath.classList.add("d-none");

    clientBtn.classList.add("active", "text-dark");
    clientBtn.classList.remove("text-muted");
    freelancerBtn.classList.remove("active", "text-dark");
    freelancerBtn.classList.add("text-muted");
  } else {
    clientPath.classList.add("d-none");
    freelancerPath.classList.remove("d-none");

    freelancerBtn.classList.add("active", "text-dark");
    freelancerBtn.classList.remove("text-muted");
    clientBtn.classList.remove("active", "text-dark");
    clientBtn.classList.add("text-muted");
  }
}
