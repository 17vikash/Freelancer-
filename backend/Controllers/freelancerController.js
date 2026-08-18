const Proposal = require("../models/Proposal");
const FreelancerProfile = require("../models/FreelancerProfile");
const User = require("../models/User");
const Review = require("../models/Review");

// @desc    Get freelancer's submitted proposals
// @route   GET /api/freelancers/me/proposals
exports.getFreelancerProposals = async (req, res) => {
  try {
    const proposalsData = await Proposal.find({ freelancer: req.user.id })
      .populate("job", "title category status")
      .sort({ createdAt: -1 });

    const proposals = proposalsData.map(p => ({
      id: p._id,
      jobId: p.job ? p.job._id : null,
      jobTitle: p.job ? p.job.title : "Job Title",
      bidAmount: p.bidAmount,
      duration: p.duration,
      coverLetter: p.coverLetter,
      status: p.status === "accepted" ? "Accepted" : p.status === "rejected" ? "Rejected" : "Pending",
      submittedDate: p.createdAt.toISOString().split("T")[0]
    }));

    res.status(200).json(proposals);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to fetch freelancer proposals." });
  }
};

// @desc    Get freelancer statistics
// @route   GET /api/freelancers/me/stats
exports.getFreelancerStats = async (req, res) => {
  try {
    const appliedCount = await Proposal.countDocuments({ freelancer: req.user.id });
    const ongoingProjects = await Proposal.countDocuments({ freelancer: req.user.id, status: "accepted" });

    res.status(200).json({
      success: true,
      appliedCount,
      ongoingProjects,
      totalEarned: 145000,
      rating: 4.95
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to fetch freelancer stats." });
  }
};

// @desc    Get public freelancer profile
// @route   GET /api/freelancers/:id
exports.getFreelancerProfile = async (req, res) => {
  try {
    let profile = await FreelancerProfile.findOne({ user: req.params.id }).populate("user", "name email");

    if (!profile) {
      // Fallback response for demo
      const user = await User.findById(req.params.id);
      return res.status(200).json({
        id: req.params.id,
        name: user ? user.name : "Alex Rivera",
        title: "Senior Full-Stack Developer & UI/UX Architect",
        hourlyRate: 1500,
        rating: 4.95,
        reviewCount: 42,
        skills: ["React", "Node.js", "TypeScript", "Figma", "PostgreSQL", "TailwindCSS"],
        bio: "Passionate full-stack developer with 7+ years of experience crafting high-performance web applications and SaaS dashboards.",
        portfolio: [
          { id: "p1", title: "Apex Fintech Dashboard", image: "https://picsum.photos/seed/fintech/600/400", link: "#" },
          { id: "p2", title: "Crypto Tracker Mobile App", image: "https://picsum.photos/seed/crypto/600/400", link: "#" }
        ]
      });
    }

    res.status(200).json({
      id: profile._id,
      name: profile.user ? profile.user.name : "Freelancer Name",
      title: profile.title,
      hourlyRate: profile.hourlyRate,
      rating: profile.avgRating || 4.95,
      reviewCount: 42,
      skills: profile.skills,
      bio: profile.bio,
      portfolio: profile.portfolio
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to fetch freelancer profile." });
  }
};

// @desc    Get public reviews for freelancer
// @route   GET /api/freelancers/:id/reviews
exports.getFreelancerReviews = async (req, res) => {
  try {
    const reviewsData = await Review.find({ reviewee: req.params.id }).populate("reviewer", "name");
    
    if (reviewsData.length === 0) {
      return res.status(200).json([
        { id: "r1", reviewer: "Apex Financial Labs", rating: 5, date: "2026-07-20", comment: "Delivered our dashboard ahead of schedule with flawless code quality and communication." },
        { id: "r2", reviewer: "CloudScale Inc.", rating: 4.9, date: "2026-06-15", comment: "Top tier React expertise. Solved complex performance bottlenecks effortlessly." }
      ]);
    }

    const reviews = reviewsData.map(r => ({
      id: r._id,
      reviewer: r.reviewer ? r.reviewer.name : "Client",
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt.toISOString().split("T")[0]
    }));

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to fetch reviews." });
  }
};
