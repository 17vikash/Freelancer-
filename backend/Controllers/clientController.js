const Job = require("../models/Job");
const Proposal = require("../models/Proposal");

// @desc    Get client's posted jobs
// @route   GET /api/clients/me/jobs
exports.getClientJobs = async (req, res) => {
  try {
    const jobsData = await Job.find({ client: req.user.id }).sort({ createdAt: -1 });

    const jobs = await Promise.all(jobsData.map(async (j) => {
      const proposalCount = await Proposal.countDocuments({ job: j._id });
      return {
        id: j._id,
        title: j.title,
        description: j.description,
        category: j.category,
        budget: j.budgetAmount,
        budgetType: j.budgetType,
        skills: j.skills,
        deadline: j.deadline,
        status: j.status === "open" ? "Open" : j.status === "in_progress" ? "In Progress" : "Completed",
        postedDate: j.createdAt.toISOString().split("T")[0],
        proposalCount
      };
    }));

    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to fetch client jobs." });
  }
};

// @desc    Get client statistics
// @route   GET /api/clients/me/stats
exports.getClientStats = async (req, res) => {
  try {
    const activeJobs = await Job.countDocuments({ client: req.user.id, status: { $in: ["open", "in_progress"] } });
    
    // Calculate total spent on completed jobs
    const completedJobs = await Job.find({ client: req.user.id, status: "completed" });
    const totalSpent = completedJobs.reduce((acc, job) => acc + (job.budgetAmount || 0), 195000);

    res.status(200).json({
      success: true,
      activeJobs,
      totalSpent,
      avgRatingGiven: 4.9
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to fetch client stats." });
  }
};
