/**
 * Freelancer Marketplace — Dynamic Navbar Renderer & Ultra Preloader System
 * Renders stateful header navigation and manages global loading transitions.
 */

document.addEventListener("DOMContentLoaded", () => {
  injectAppPreloader();
  renderNavbar();

  // Dismiss preloader smoothly
  setTimeout(() => {
    dismissAppPreloader();
  }, 450);
});

function injectAppPreloader() {
  if (document.getElementById("app-preloader")) return;

  const preloader = document.createElement("div");
  preloader.id = "app-preloader";
  preloader.innerHTML = `
    <div class="preloader-orbit-spinner">
      <div class="preloader-ring"></div>
      <div class="preloader-ring preloader-ring-outer"></div>
      <svg class="preloader-logo-icon" viewBox="0 0 40 40" fill="none">
        <path d="M20 4L34.641 12.45V27.55L20 36L5.35898 27.55V12.45L20 4Z" fill="url(#preloaderGrad)" />
        <path d="M20 12L28 16.5V23.5L20 28L12 23.5V16.5L20 12Z" fill="#FFFFFF" opacity="0.9"/>
        <defs>
          <linearGradient id="preloaderGrad" x1="5" y1="4" x2="35" y2="36" gradientUnits="userSpaceOnUse">
            <stop stop-color="#3B34D6" />
            <stop offset="1" stop-color="#10B981" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div class="preloader-text">Freelancer Marketplace</div>
    <div class="preloader-progress-track">
      <div class="preloader-progress-bar"></div>
    </div>
  `;

  document.body.appendChild(preloader);
}

function dismissAppPreloader() {
  const preloader = document.getElementById("app-preloader");
  if (!preloader) return;
  preloader.style.opacity = "0";
  setTimeout(() => {
    preloader.style.visibility = "hidden";
  }, 400);
}

function renderNavbar() {
  const navContainer = document.getElementById("main-navbar");
  if (!navContainer) return;

  const user = getUser();
  const token = getToken();

  let leftNavLinks = "";

  if (user) {
    if (user.role === "client") {
      leftNavLinks = `
        <li class="nav-item">
          <a class="nav-link nav-link-custom" href="post-job.html"><i class="fas fa-plus-circle text-primary me-1"></i>Post a Job</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-link-custom" href="client-jobs.html">My Jobs</a>
        </li>
      `;
    } else {
      leftNavLinks = `
        <li class="nav-item">
          <a class="nav-link nav-link-custom" href="jobs.html">Browse Jobs</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-link-custom" href="freelancer-dashboard.html">My Proposals</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-link-custom" href="profile.html?id=${user.id || 'free-301'}">My Profile</a>
        </li>
      `;
    }
  } else {
    leftNavLinks = `
      <li class="nav-item">
        <a class="nav-link nav-link-custom" href="jobs.html">Browse Jobs</a>
      </li>
    `;
  }

  let rightAuthArea = "";

  if (user && token) {
    const initials = user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "US";
    const dashboardUrl = user.role === "client" ? "client-dashboard.html" : "freelancer-dashboard.html";

    rightAuthArea = `
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-link text-dark position-relative p-0 me-2" title="Notifications" aria-label="Notifications">
          <i class="far fa-bell fs-5"></i>
          <span class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
            <span class="visually-hidden">New alerts</span>
          </span>
        </button>

        <div class="dropdown">
          <button class="btn p-0 border-0 d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <div class="avatar-circle">${initials}</div>
            <div class="text-start d-none d-md-block">
              <div class="fw-bold fs-7 lh-1 mb-1">${user.name}</div>
              <span class="badge badge-primary text-uppercase" style="font-size: 0.65rem;">${user.role}</span>
            </div>
            <i class="fas fa-chevron-down text-muted fs-8 ms-1"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2">
            <li><a class="dropdown-item py-2" href="${dashboardUrl}"><i class="fas fa-chart-line me-2 text-primary"></i>Dashboard</a></li>
            <li><a class="dropdown-item py-2" href="settings.html"><i class="fas fa-cog me-2 text-muted"></i>Settings</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><button class="dropdown-item py-2 text-danger" onclick="logout()"><i class="fas fa-sign-out-alt me-2"></i>Sign out</button></li>
          </ul>
        </div>
      </div>
    `;
  } else {
    rightAuthArea = `
      <div class="d-flex align-items-center gap-2">
        <a href="login.html" class="gg-btn-outline gg-btn-sm">Log in</a>
        <a href="signup.html" class="gg-btn-primary gg-btn-sm">Get started</a>
      </div>
    `;
  }

  // Highlight active page
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  navContainer.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-gg">
      <div class="container">
        <a class="navbar-brand navbar-brand-logo d-flex align-items-center gap-2" href="index.html">
          <svg class="brand-logo-svg" viewBox="0 0 40 40" fill="none">
            <path d="M20 4L34.641 12.45V27.55L20 36L5.35898 27.55V12.45L20 4Z" fill="url(#navBrandGrad)" />
            <path d="M20 12L28 16.5V23.5L20 28L12 23.5V16.5L20 12Z" fill="#FFFFFF" opacity="0.95"/>
            <defs>
              <linearGradient id="navBrandGrad" x1="5" y1="4" x2="35" y2="36" gradientUnits="userSpaceOnUse">
                <stop stop-color="#3B34D6" />
                <stop offset="1" stop-color="#10B981" />
              </linearGradient>
            </defs>
          </svg>
          <span class="fw-bold">Freelancer Marketplace</span> <span class="brand-badge">LIVE</span>
        </a>
        
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navContent" aria-controls="navContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            ${leftNavLinks}
          </ul>
          ${rightAuthArea}
        </div>
      </div>
    </nav>
  `;

  // Set active class on nav links
  const links = navContainer.querySelectorAll(".nav-link-custom");
  links.forEach(link => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });
}
