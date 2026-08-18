/**
 * Freelancer Marketplace — Public Profile Controller
 */

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const freelancerId = urlParams.get("id") || "free-301";

  await loadProfile(freelancerId);
});

async function loadProfile(id) {
  const skeleton = document.getElementById("profile-skeleton");
  const content = document.getElementById("profile-content");

  try {
    const profile = await apiRequest(`/freelancers/${id}`);
    
    // Header & Meta
    document.getElementById("profile-name").textContent = profile.name;
    document.getElementById("profile-title").textContent = profile.title;
    document.getElementById("profile-rate").textContent = `₹${profile.hourlyRate.toLocaleString()}/hr`;
    document.getElementById("profile-rating").textContent = profile.rating || "5.0";
    document.getElementById("profile-review-count").textContent = profile.reviewCount || 0;
    document.getElementById("profile-bio").textContent = profile.bio;

    const initials = profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    document.getElementById("profile-avatar").textContent = initials;

    // Skills
    const skillsContainer = document.getElementById("profile-skills");
    skillsContainer.innerHTML = (profile.skills || []).map(skill => `<span class="skill-tag">${skill}</span>`).join(" ");

    // Portfolio Grid
    renderPortfolio(profile.portfolio || []);

    // Fetch & Render Reviews
    const reviews = await apiRequest(`/freelancers/${id}/reviews`);
    renderReviews(reviews);

  } catch (err) {
    showToast("Failed to load freelancer profile details.", "error");
  } finally {
    skeleton.classList.add("d-none");
    content.classList.remove("d-none");
  }
}

function renderPortfolio(portfolioItems) {
  const container = document.getElementById("portfolio-container");
  const emptyState = document.getElementById("portfolio-empty");

  if (portfolioItems.length === 0) {
    emptyState.classList.remove("d-none");
    return;
  }

  container.innerHTML = portfolioItems.map(item => `
    <div class="col-md-4">
      <div class="gg-card gg-card-interactive p-0 overflow-hidden h-100">
        <img src="${item.image}" class="img-fluid w-100" style="height: 180px; object-fit: cover;" alt="${item.title}">
        <div class="p-3">
          <h6 class="fw-bold mb-1">${item.title}</h6>
          <a href="${item.link}" target="_blank" class="fs-8 text-primary fw-semibold">View Case Study <i class="fas fa-external-link-alt ms-1"></i></a>
        </div>
      </div>
    </div>
  `).join("");
}

function renderReviews(reviews) {
  const container = document.getElementById("reviews-container");
  const emptyState = document.getElementById("reviews-empty");

  if (!reviews || reviews.length === 0) {
    emptyState.classList.remove("d-none");
    return;
  }

  container.innerHTML = reviews.map(rev => {
    const stars = '★'.repeat(Math.floor(rev.rating)) + (rev.rating % 1 !== 0 ? '½' : '');

    return `
      <div class="p-3 bg-light rounded border border-light">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div class="fw-bold text-dark">${rev.reviewer}</div>
          <span class="text-warning mono-font fw-bold">${stars} (${rev.rating})</span>
        </div>
        <p class="fs-7 text-muted mb-2">"${rev.comment}"</p>
        <div class="fs-8 text-muted mono-font">${rev.date}</div>
      </div>
    `;
  }).join("");
}
