const Job = require("../models/Job");
const Proposal = require("../models/Proposal");
const User = require("../models/User");

// @desc    Get all jobs with filtering & pagination
// @route   GET /api/jobs
exports.getJobs = async (req, res) => {
  try {
    const { search, category, budget, budgetMin, budgetMax, budgetType, type, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, "i")] } }
      ];
    }

    if (category) {
      query.category = category;
    }

    const bType = budgetType || type;
    if (bType) {
      query.budgetType = bType;
    }

    const maxB = budget || budgetMax;
    if (maxB || budgetMin) {
      query.budgetAmount = {};
      if (budgetMin) query.budgetAmount.$gte = Number(budgetMin);
      if (maxB) query.budgetAmount.$lte = Number(maxB);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(query);
    const jobsData = await Job.find(query)
      .populate("client", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Map response for frontend
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
        clientName: j.client ? j.client.name : "Anonymous Client",
        clientRating: 4.9,
        proposalCount
      };
    }));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      jobs
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch jobs."
    });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("client", "name email");
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job listing not found."
      });
    }

    const proposalCount = await Proposal.countDocuments({ job: job._id });

    res.status(200).json({
      success: true,
      id: job._id,
      title: job.title,
      description: job.description,
      category: job.category,
      budget: job.budgetAmount,
      budgetType: job.budgetType,
      skills: job.skills,
      deadline: job.deadline,
      status: job.status === "open" ? "Open" : job.status === "in_progress" ? "In Progress" : "Completed",
      postedDate: job.createdAt.toISOString().split("T")[0],
      clientName: job.client ? job.client.name : "Client",
      clientRating: 5.0,
      proposalCount,
      job
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch job details."
    });
  }
};

// @desc    Post a new job
// @route   POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    const { title, description, category, budgetType, budgetAmount, budget, skills, deadline } = req.body;

    const newJob = await Job.create({
      client: req.user.id,
      title,
      description,
      category,
      budgetType: budgetType || "fixed",
      budgetAmount: budgetAmount || budget,
      skills: Array.isArray(skills) ? skills : [skills],
      deadline
    });

    res.status(201).json({
      success: true,
      message: "Job posted successfully!",
      job: newJob
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to post job."
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    if (job.client.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this job listing." });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: "Job updated successfully!",
      job
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to update job." });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    if (job.client.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this job listing." });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: "Job deleted successfully."
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to delete job." });
  }
};
